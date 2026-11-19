from django.core.management.base import BaseCommand
from accounts.models import Permission, CustomUser


class Command(BaseCommand):
    help = "Splits and updates KYC approval permissions into Approve KYC 1 and Approve KYC 2 on production"

    def handle(self, *args, **options):
        self.stdout.write("Configuring KYC approval permissions...")

        # 1. Update or create approve1_kyc ('Approve KYC 1')
        p1 = Permission.objects.filter(code='approve1_kyc').first()
        if not p1:
            p1 = Permission.objects.filter(code='approve_kyc').first()
            if p1:
                p1.code = 'approve1_kyc'
                p1.name = 'Approve KYC 1'
                p1.save()
                self.stdout.write(self.style.SUCCESS(f"Renamed permission id={p1.id} (approve_kyc) to approve1_kyc ('Approve KYC 1')"))
            else:
                p1 = Permission.objects.create(code='approve1_kyc', name='Approve KYC 1')
                self.stdout.write(self.style.SUCCESS(f"Created new permission id={p1.id} (approve1_kyc)"))
        else:
            if p1.name != 'Approve KYC 1':
                p1.name = 'Approve KYC 1'
                p1.save()
            self.stdout.write(f"Permission approve1_kyc already exists (id={p1.id})")

        # 2. Update or create approve2_kyc ('Approve KYC 2')
        p2 = Permission.objects.filter(code='approve2_kyc').first()
        if not p2:
            # Look for old typo 'aprove_kyc' or duplicate 'Approve KYC'
            p2 = Permission.objects.filter(code='aprove_kyc').first()
            if not p2:
                p2 = Permission.objects.filter(name='Approve KYC').exclude(id=p1.id).first()
            if p2:
                p2.code = 'approve2_kyc'
                p2.name = 'Approve KYC 2'
                p2.save()
                self.stdout.write(self.style.SUCCESS(f"Renamed permission id={p2.id} ({p2.code}) to approve2_kyc ('Approve KYC 2')"))
            else:
                p2 = Permission.objects.create(code='approve2_kyc', name='Approve KYC 2')
                self.stdout.write(self.style.SUCCESS(f"Created new permission id={p2.id} (approve2_kyc)"))
        else:
            if p2.name != 'Approve KYC 2':
                p2.name = 'Approve KYC 2'
                p2.save()
            self.stdout.write(f"Permission approve2_kyc already exists (id={p2.id})")

        # 3. Clean up any remaining duplicate 'Approve KYC' records
        stale_perms = Permission.objects.filter(name='Approve KYC').exclude(id__in=[p1.id, p2.id])
        if stale_perms.exists():
            count = stale_perms.count()
            stale_perms.delete()
            self.stdout.write(self.style.WARNING(f"Deleted {count} stale duplicate 'Approve KYC' permission(s)"))

        # 4. Ensure superusers have both permissions assigned
        superusers = CustomUser.objects.filter(is_superuser=True)
        for su in superusers:
            su.permissions.add(p1, p2)
        if superusers.exists():
            self.stdout.write(self.style.SUCCESS(f"Ensured {superusers.count()} superuser(s) have Approve KYC 1 & 2 assigned"))

        # 5. Display current KYC permissions
        self.stdout.write("\nCurrent KYC Permissions in database:")
        for perm in Permission.objects.filter(name__icontains='kyc').order_by('id'):
            self.stdout.write(f"  [{perm.id}] {perm.code} -> {perm.name}")

        self.stdout.write(self.style.SUCCESS("\nKYC permissions configured successfully!"))
