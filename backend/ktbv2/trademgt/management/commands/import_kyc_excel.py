import os
import pandas as pd
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from trademgt.models import Kyc, KycBankDetail


def clean_val(val, default=''):
    if pd.isna(val) or val is None:
        return default
    val_str = str(val).strip()
    if val_str.lower() in ('nan', 'none', 'null'):
        return default
    # Handle floats like 123456.0 from excel integers
    if isinstance(val, float) and val.is_integer():
        return str(int(val))
    return val_str


def normalize_col(col_name):
    """Normalize column header to lowercase alphanumeric for robust matching."""
    return ''.join(c for c in str(col_name).lower() if c.isalnum())


class Command(BaseCommand):
    help = "Bulk import KYC records from an Excel (.xlsx, .xls) or CSV file."

    def add_arguments(self, parser):
        parser.add_argument(
            'file_path',
            type=str,
            help="Path to the Excel file (.xlsx, .xls, .csv) containing KYC data."
        )
        parser.add_argument(
            '--approve1',
            action='store_true',
            default=False,
            help="Set approve1=True for all newly created/imported KYC records."
        )
        parser.add_argument(
            '--approve2',
            action='store_true',
            default=False,
            help="Set approve2=True for all newly created/imported KYC records."
        )
        parser.add_argument(
            '--update-existing',
            action='store_true',
            default=False,
            help="Update existing KYC records if matched by company name or reg no."
        )
        parser.add_argument(
            '--match-by',
            type=str,
            choices=['name', 'reg_no', 'either', 'both'],
            default='either',
            help="Matching strategy for existing records: 'name', 'reg_no', 'either' (default), or 'both'."
        )
        parser.add_argument(
            '--sheet-name',
            type=str,
            default=0,
            help="Sheet name or index to read from the Excel file (default: first sheet)."
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            default=False,
            help="Simulate the import process without writing changes to the database."
        )

    def handle(self, *args, **options):
        file_path = options['file_path']
        approve1_flag = options['approve1']
        approve2_flag = options['approve2']
        update_existing = options['update_existing']
        match_by = options['match_by']
        sheet_name = options['sheet_name']
        dry_run = options['dry_run']

        if not os.path.exists(file_path):
            raise CommandError(f"File not found: {file_path}")

        self.stdout.write(self.style.NOTICE(f"Loading file: {file_path}"))
        if dry_run:
            self.stdout.write(self.style.WARNING("--- RUNNING IN DRY RUN MODE (No changes will be saved) ---"))

        try:
            if file_path.endswith('.csv'):
                df = pd.read_csv(file_path)
            else:
                df = pd.read_excel(file_path, sheet_name=sheet_name)
        except Exception as e:
            raise CommandError(f"Error reading file '{file_path}': {str(e)}")

        if df.empty:
            self.stdout.write(self.style.WARNING("The file contains no data."))
            return

        # Build column index mapping
        norm_to_actual = {normalize_col(col): col for col in df.columns}

        def get_field_val(row, aliases, default=''):
            for alias in aliases:
                norm_alias = normalize_col(alias)
                if norm_alias in norm_to_actual:
                    val = row[norm_to_actual[norm_alias]]
                    cleaned = clean_val(val, default)
                    if cleaned:
                        return cleaned
            return default

        total_rows = len(df)
        created_count = 0
        updated_count = 0
        skipped_count = 0
        error_count = 0

        self.stdout.write(self.style.NOTICE(f"Found {total_rows} row(s) to process.\n"))

        try:
            with transaction.atomic():
                for idx, row in df.iterrows():
                    row_num = idx + 2  # Excel 1-based index + header row

                    name = get_field_val(row, ['name', 'company_name', 'companyname', 'customer_name'])
                    company_reg_no = get_field_val(row, ['companyregno', 'company_reg_no', 'reg_no', 'company_reg_number', 'registration_no', 'regno'])
                    date_val = get_field_val(row, ['date', 'kyc_date', 'entry_date'])
                    reg_address = get_field_val(row, ['regaddress', 'reg_address', 'registered_address', 'registeredaddress'])
                    mailing_address = get_field_val(row, ['mailingaddress', 'mailing_address', 'mail_address', 'address'])
                    telephone = get_field_val(row, ['telephone', 'phone', 'tel', 'phone_number', 'contact_number'])
                    fax = get_field_val(row, ['fax', 'fax_number'])

                    # Contact Persons
                    person1 = get_field_val(row, ['person1', 'person_1', 'contact_person_1', 'contact_person1', 'contact1'])
                    designation1 = get_field_val(row, ['designation1', 'designation_1'])
                    mobile1 = get_field_val(row, ['mobile1', 'mobile_1', 'phone1', 'mobile_number1'])
                    email1 = get_field_val(row, ['email1', 'email_1', 'e_mail1', 'email_address1'])

                    person2 = get_field_val(row, ['person2', 'person_2', 'contact_person_2', 'contact_person2', 'contact2'])
                    designation2 = get_field_val(row, ['designation2', 'designation_2'])
                    mobile2 = get_field_val(row, ['mobile2', 'mobile_2', 'phone2', 'mobile_number2'])
                    email2 = get_field_val(row, ['email2', 'email_2', 'e_mail2', 'email_address2'])

                    # Primary / General Bank Details
                    banker = get_field_val(row, ['banker', 'bank_name', 'bank', 'banker1', 'banker_1'])
                    bank_address = get_field_val(row, ['bank_address', 'address1', 'address_1'])
                    if not bank_address:
                        # Only use generic address if not matching mailing address
                        bank_address = get_field_val(row, ['bankaddress'])
                    swift_code = get_field_val(row, ['swiftcode', 'swift_code', 'swift', 'swiftcode1', 'swift_code_1'])
                    account_number = get_field_val(row, ['accountnumber', 'account_number', 'acc_no', 'accountno', 'accountnumber1', 'account_number_1'])

                    # Multi-bank bank details collection
                    banks = []
                    # Check for Bank 1..5 columns
                    for i in range(1, 6):
                        b_banker = get_field_val(row, [f'banker{i}', f'banker_{i}', f'bank_name_{i}', f'bank{i}'])
                        b_addr = get_field_val(row, [f'bank_address_{i}', f'bankaddress{i}', f'address_{i}', f'address{i}'])
                        b_swift = get_field_val(row, [f'swiftcode{i}', f'swift_code_{i}', f'swift{i}'])
                        b_acc = get_field_val(row, [f'accountnumber{i}', f'account_number_{i}', f'acc_no_{i}', f'accountno{i}'])

                        if b_banker or b_acc or b_swift or b_addr:
                            banks.append({
                                'banker': b_banker,
                                'address': b_addr,
                                'swiftCode': b_swift,
                                'accountNumber': b_acc,
                            })

                    # If no multi-bank columns found, but primary bank details present
                    if not banks and (banker or account_number or swift_code or bank_address):
                        banks.append({
                            'banker': banker,
                            'address': bank_address,
                            'swiftCode': swift_code,
                            'accountNumber': account_number,
                        })

                    if not name:
                        self.stdout.write(self.style.ERROR(f"[Row {row_num}] Skipped: Missing Company Name."))
                        error_count += 1
                        continue

                    # Check for approvals in row if flags not set
                    row_approve1 = approve1_flag
                    if not row_approve1:
                        app1_raw = get_field_val(row, ['approve1', 'approve_1', 'approved1', 'approved_1'])
                        if app1_raw:
                            row_approve1 = str(app1_raw).lower() in ('true', '1', 'yes', 'y')

                    row_approve2 = approve2_flag
                    if not row_approve2:
                        app2_raw = get_field_val(row, ['approve2', 'approve_2', 'approved2', 'approved_2'])
                        if app2_raw:
                            row_approve2 = str(app2_raw).lower() in ('true', '1', 'yes', 'y')

                    # Duplicate check
                    existing_kyc = None
                    if match_by == 'name':
                        existing_kyc = Kyc.objects.filter(name__iexact=name).first()
                    elif match_by == 'reg_no':
                        if company_reg_no:
                            existing_kyc = Kyc.objects.filter(companyRegNo__iexact=company_reg_no).first()
                    elif match_by == 'both':
                        if company_reg_no:
                            existing_kyc = Kyc.objects.filter(name__iexact=name, companyRegNo__iexact=company_reg_no).first()
                    else:  # 'either' (default)
                        if company_reg_no:
                            existing_kyc = Kyc.objects.filter(companyRegNo__iexact=company_reg_no).first()
                        if not existing_kyc:
                            existing_kyc = Kyc.objects.filter(name__iexact=name).first()

                    if existing_kyc:
                        if update_existing:
                            if not dry_run:
                                existing_kyc.date = date_val or existing_kyc.date
                                existing_kyc.companyRegNo = company_reg_no or existing_kyc.companyRegNo
                                existing_kyc.regAddress = reg_address or existing_kyc.regAddress
                                existing_kyc.mailingAddress = mailing_address or existing_kyc.mailingAddress
                                existing_kyc.telephone = telephone or existing_kyc.telephone
                                existing_kyc.fax = fax or existing_kyc.fax
                                existing_kyc.person1 = person1 or existing_kyc.person1
                                existing_kyc.designation1 = designation1 or existing_kyc.designation1
                                existing_kyc.mobile1 = mobile1 or existing_kyc.mobile1
                                existing_kyc.email1 = email1 or existing_kyc.email1
                                existing_kyc.person2 = person2 or existing_kyc.person2
                                existing_kyc.designation2 = designation2 or existing_kyc.designation2
                                existing_kyc.mobile2 = mobile2 or existing_kyc.mobile2
                                existing_kyc.email2 = email2 or existing_kyc.email2
                                existing_kyc.banker = banker or existing_kyc.banker
                                existing_kyc.address = bank_address or existing_kyc.address
                                existing_kyc.swiftCode = swift_code or existing_kyc.swiftCode
                                existing_kyc.accountNumber = account_number or existing_kyc.accountNumber

                                if row_approve1:
                                    existing_kyc.approve1 = True
                                if row_approve2:
                                    existing_kyc.approve2 = True

                                existing_kyc.save()

                                # Update bank details if provided
                                if banks:
                                    KycBankDetail.objects.filter(kyc=existing_kyc).delete()
                                    for b in banks:
                                        KycBankDetail.objects.create(
                                            kyc=existing_kyc,
                                            banker=b.get('banker', ''),
                                            address=b.get('address', ''),
                                            swiftCode=b.get('swiftCode', ''),
                                            accountNumber=b.get('accountNumber', '')
                                        )

                            updated_count += 1
                            self.stdout.write(self.style.SUCCESS(f"[Row {row_num}] Updated KYC for '{name}' (ID: {existing_kyc.id})."))
                        else:
                            skipped_count += 1
                            self.stdout.write(self.style.WARNING(f"[Row {row_num}] Skipped: KYC for '{name}' already exists (ID: {existing_kyc.id})."))
                    else:
                        if not dry_run:
                            new_kyc = Kyc.objects.create(
                                name=name,
                                companyRegNo=company_reg_no,
                                date=date_val,
                                regAddress=reg_address,
                                mailingAddress=mailing_address,
                                telephone=telephone,
                                fax=fax,
                                person1=person1,
                                designation1=designation1,
                                mobile1=mobile1,
                                email1=email1,
                                person2=person2,
                                designation2=designation2,
                                mobile2=mobile2,
                                email2=email2,
                                banker=banker,
                                address=bank_address,
                                swiftCode=swift_code,
                                accountNumber=account_number,
                                approve1=row_approve1,
                                approve2=row_approve2,
                            )

                            for b in banks:
                                KycBankDetail.objects.create(
                                    kyc=new_kyc,
                                    banker=b.get('banker', ''),
                                    address=b.get('address', ''),
                                    swiftCode=b.get('swiftCode', ''),
                                    accountNumber=b.get('accountNumber', '')
                                )

                        created_count += 1
                        approval_info = []
                        if row_approve1:
                            approval_info.append("Approve1=True")
                        if row_approve2:
                            approval_info.append("Approve2=True")
                        app_str = f" [{', '.join(approval_info)}]" if approval_info else ""
                        self.stdout.write(self.style.SUCCESS(f"[Row {row_num}] Created KYC for '{name}'{app_str}."))

                if dry_run:
                    # Rollback all changes in dry-run mode
                    transaction.set_rollback(True)

        except Exception as e:
            raise CommandError(f"Import aborted due to error: {str(e)}")

        # Summary
        self.stdout.write("\n" + "=" * 50)
        self.stdout.write(self.style.NOTICE("IMPORT SUMMARY"))
        self.stdout.write("=" * 50)
        self.stdout.write(f"Total Rows:     {total_rows}")
        self.stdout.write(self.style.SUCCESS(f"Created:        {created_count}"))
        self.stdout.write(self.style.SUCCESS(f"Updated:        {updated_count}"))
        self.stdout.write(self.style.WARNING(f"Skipped:        {skipped_count}"))
        if error_count > 0:
            self.stdout.write(self.style.ERROR(f"Errors/Invalid: {error_count}"))
        self.stdout.write("=" * 50)
