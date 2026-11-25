from django.test import TestCase
from datetime import date
from trademgt.models import Trade, TradeProduct, TradePending, Company, Kyc
from accounts.models import CustomUser, Permission
from accounts.permissions import can_user_update_approved, can_user_delete_approved

class TradePendingSyncTests(TestCase):
    def setUp(self):
        self.trade = Trade.objects.create(
            company="Test Company",
            trd=date(2026, 1, 1),
            trn="TRN-TEST-001",
            trade_type="Purchase",
            trade_category="Purchase",
            country_of_origin="Country",
            customer_company_name="Customer Ltd",
            address="Test Address",
            currency_selection="USD",
            exchange_rate=1.0,
            commission_agent="Agent",
            contract_value=1000.0,
            payment_term="1",
            advance_value_to_receive=100.0,
            commission_value=0.0,
            logistic_provider="NA",
            estimated_logistic_cost=0.0,
            logistic_cost_tolerence=0.0,
            bank_name_address="Bank",
            account_number="12345",
            swift_code="SWIFT",
            incoterm="FOB",
            pod="POD",
            pol="POL",
            eta="2026-02-01",
            etd="2026-01-15",
            remarks="None",
            trader_name="Trader",
            insurance_policy_number="INS001",
            shipper_in_bl="Shipper",
            consignee_in_bl="Consignee",
            notify_party_in_bl="Notify",
            bl_fee=0.0,
            bl_fee_remarks="None",
            approved=False,
            reviewed=False
        )

    def test_trade_product_create_and_update_currency_rate_syncs_trade_pending(self):
        # 1. Initial TradeProduct creation
        product = TradeProduct.objects.create(
            trade=self.trade,
            product_code="PROD-001",
            product_name="Product 1",
            product_name_for_client="NA",
            hs_code="123456",
            total_contract_qty=100.0,
            total_contract_qty_unit="MT",
            tolerance=5.0,
            contract_balance_qty=100.0,
            contract_balance_qty_unit="MT",
            trade_qty=50.0,
            trade_qty_unit="MT",
            selected_currency_rate=150.0,
            rate_in_usd=150.0,
            product_value=7500.0,
            markings_in_packaging="None",
            packaging_supplier="Supplier",
            mode_of_packing="Bulk",
            rate_of_each_packing=0.0,
            qty_of_packing=0.0,
            total_packing_cost=0.0,
            commission_rate=0.0,
            total_commission=0.0,
            ref_product_code="NA",
            ref_trn="NA",
            logistic=10.0,
            logistic_remark="None",
            container_shipment_size="20ft"
        )

        # Verify TradePending was created with initial currency rate
        pending = TradePending.objects.filter(trn=self.trade, product_code="PROD-001").first()
        self.assertIsNotNone(pending)
        self.assertEqual(pending.selected_currency_rate, 150.0)
        self.assertEqual(pending.rate_in_usd, 150.0)

        # 2. Simulate Trade update: delete old product, recreate with new selected_currency_rate
        TradeProduct.objects.filter(trade=self.trade).delete()

        updated_product = TradeProduct(
            trade=self.trade,
            product_code="PROD-001",
            product_name="Product 1",
            product_name_for_client="NA",
            hs_code="123456",
            total_contract_qty=100.0,
            total_contract_qty_unit="MT",
            tolerance=5.0,
            contract_balance_qty=100.0,
            contract_balance_qty_unit="MT",
            trade_qty=50.0,
            trade_qty_unit="MT",
            selected_currency_rate=225.5,
            rate_in_usd=225.5,
            product_value=11275.0,
            markings_in_packaging="None",
            packaging_supplier="Supplier",
            mode_of_packing="Bulk",
            rate_of_each_packing=0.0,
            qty_of_packing=0.0,
            total_packing_cost=0.0,
            commission_rate=0.0,
            total_commission=0.0,
            ref_product_code="NA",
            ref_trn="NA",
            logistic=15.0,
            logistic_remark="None",
            container_shipment_size="20ft"
        )
        updated_product.previous_trade_qty = 50.0
        updated_product.old_value = 52.5
        updated_product.save()

        # Verify TradePending was synchronized with the updated rate
        pending.refresh_from_db()
        self.assertEqual(pending.selected_currency_rate, 225.5)
        self.assertEqual(pending.rate_in_usd, 225.5)
        self.assertEqual(pending.logistic, 15.0)

    def test_manager2_update_and_delete_permissions(self):
        manager2 = CustomUser.objects.create_user(
            email="manager2@test.com",
            name="Manager2 User",
            password="password123",
            role="Manager2"
        )
        update_perm = Permission.objects.create(code="update_trade_form", name="Update Trade")
        manager2.permissions.add(update_perm)

        # Should be authorized for update_trade_approval via base matching
        self.assertTrue(can_user_update_approved(manager2, ['update_trade_approval']))
        self.assertTrue(can_user_update_approved(manager2, ['update_trade_approved']))

class CompanyDynamicNextCounterTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(
            name="Alpha Trading Ltd",
            initial="AT",
            counter=10,
            registration_number="REG-100",
            address="123 Alpha Way"
        )

    def test_next_counter_standard_increment(self):
        self.assertEqual(self.company.get_next_counter(), "AT-0000011")

    def test_next_counter_detects_existing_trades_and_skips(self):
        # Create a trade with AT-0000011 and AT-0000012
        Trade.objects.create(
            company=str(self.company.id),
            trd=date(2026, 1, 1),
            trn="AT-0000011",
            trade_type="Sales",
            trade_category="Sales",
            country_of_origin="Country",
            customer_company_name="1",
            address="Address",
            currency_selection="USD",
            exchange_rate=1.0,
            commission_agent="Agent",
            contract_value=100.0,
            payment_term="1",
            advance_value_to_receive=0.0,
            commission_value=0.0,
            logistic_provider="NA",
            estimated_logistic_cost=0.0,
            logistic_cost_tolerence=0.0,
            bank_name_address="1",
            account_number="123",
            swift_code="SWIFT",
            incoterm="FOB",
            pod="POD",
            pol="POL",
            eta="2026-02-01",
            etd="2026-01-15",
            remarks="None",
            trader_name="Trader",
            insurance_policy_number="NA",
            shipper_in_bl="Shipper",
            consignee_in_bl="Consignee",
            notify_party_in_bl="Notify",
            bl_fee=0.0,
            bl_fee_remarks="None"
        )
        Trade.objects.create(
            company=str(self.company.id),
            trd=date(2026, 1, 1),
            trn="AT-0000012",
            trade_type="Sales",
            trade_category="Sales",
            country_of_origin="Country",
            customer_company_name="1",
            address="Address",
            currency_selection="USD",
            exchange_rate=1.0,
            commission_agent="Agent",
            contract_value=100.0,
            payment_term="1",
            advance_value_to_receive=0.0,
            commission_value=0.0,
            logistic_provider="NA",
            estimated_logistic_cost=0.0,
            logistic_cost_tolerence=0.0,
            bank_name_address="1",
            account_number="123",
            swift_code="SWIFT",
            incoterm="FOB",
            pod="POD",
            pol="POL",
            eta="2026-02-01",
            etd="2026-01-15",
            remarks="None",
            trader_name="Trader",
            insurance_policy_number="NA",
            shipper_in_bl="Shipper",
            consignee_in_bl="Consignee",
            notify_party_in_bl="Notify",
            bl_fee=0.0,
            bl_fee_remarks="None"
        )

        # Counter is still 10, but existing trades are up to 12. Next must be AT-0000013.
        self.assertEqual(self.company.get_next_counter(), "AT-0000013")
        self.company.refresh_from_db()
        self.assertEqual(self.company.counter, 12)




class TradeProductFileRulesTests(TestCase):
    """Specs always mandatory, LOI mandatory unless product name for client is NA, any file type."""

    def setUp(self):
        import shutil
        import tempfile
        from unittest.mock import patch
        from rest_framework.test import APIClient

        media = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, media, ignore_errors=True)
        overrides = self.settings(MEDIA_ROOT=media, GOOGLE_DRIVE_AUTO_BACKUP=False)
        overrides.enable()
        self.addCleanup(overrides.disable)
        notifier = patch('trademgt.views.NotificationService')
        notifier.start()
        self.addCleanup(notifier.stop)

        self.user = CustomUser.objects.create_superuser(
            email='files@example.com', name='Files', password='x'
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.company = Company.objects.create(name='File Co', initial='FC', counter='0')
        self.kyc = Kyc.objects.create(
            date=date(2026, 1, 1), name='Cust', approve1=True, approve2=True
        )

    def upload(self, name):
        from django.core.files.uploadedfile import SimpleUploadedFile
        return SimpleUploadedFile(name, b'data')

    def payload(self, client_name='NA', code='P-1', **files):
        data = {
            'company': self.company.id, 'trd': '2026-01-01', 'trn': 'FC-1',
            'trade_type': 'Sales', 'trade_category': 'Sales', 'country_of_origin': 'X',
            'customer_company_name': self.kyc.id, 'address': 'a', 'currency_selection': '1',
            'exchange_rate': 1, 'commission_agent': 'NA', 'contract_value': 1, 'payment_term': '1',
            'advance_value_to_receive': 0, 'commission_value': 0, 'logistic_provider': 'NA',
            'estimated_logistic_cost': 0, 'logistic_cost_tolerence': 0, 'bank_name_address': '1',
            'account_number': '1', 'swift_code': '1', 'incoterm': 'FOB', 'pod': 'a', 'pol': 'b',
            'eta': '2026-02-01', 'etd': '2026-01-15', 'remarks': 'r', 'trader_name': 't',
            'insurance_policy_number': 'NA', 'shipper_in_bl': 's', 'consignee_in_bl': 'c',
            'notify_party_in_bl': 'n', 'bl_fee': 0, 'bl_fee_remarks': 'r',
        }
        product = {
            'product_code': code, 'product_name': '1', 'product_name_for_client': client_name,
            'hs_code': '1', 'total_contract_qty': 10, 'total_contract_qty_unit': 'MT',
            'tolerance': 0, 'contract_balance_qty': 10, 'contract_balance_qty_unit': 'MT',
            'trade_qty': 5, 'trade_qty_unit': 'MT', 'selected_currency_rate': 1, 'rate_in_usd': 1,
            'product_value': 5, 'markings_in_packaging': 'm', 'packaging_supplier': self.kyc.id,
            'mode_of_packing': '1', 'rate_of_each_packing': 0, 'qty_of_packing': 0,
            'total_packing_cost': 0, 'commission_rate': 0, 'total_commission': 0,
            'ref_product_code': 'NA', 'ref_trn': 'NA', 'container_shipment_size': '1',
            'logistic': 0, 'logistic_remark': 'r', **files,
        }
        data.update({f'tradeProducts[0].{k}': v for k, v in product.items()})
        return data

    def post(self, **kwargs):
        return self.client.post('/trademgt/trades/', self.payload(**kwargs), format='multipart')

    def test_specs_is_mandatory(self):
        response = self.post()
        self.assertEqual(response.status_code, 400)
        self.assertIn('Specs is required', response.data['error'])
        self.assertFalse(Trade.objects.exists())

    def test_draft_placeholder_is_not_a_file(self):
        response = self.post(specs='[object Object]')
        self.assertEqual(response.status_code, 400)
        self.assertIn('Specs is required', response.data['error'])

    def test_loi_is_mandatory_unless_client_name_is_na(self):
        response = self.post(client_name='Client Rice', specs=self.upload('s.pdf'))
        self.assertEqual(response.status_code, 400)
        self.assertIn('LOI is required', response.data['error'])
        for i, name in enumerate(['NA', 'na', ' na ']):
            response = self.post(client_name=name, code=f'NA-{i}', specs=self.upload('s.pdf'))
            self.assertEqual(response.status_code, 201, response.data)

    def test_any_file_type_is_accepted(self):
        for i, ext in enumerate(['jpg', 'png', 'pdf', 'doc', 'docx', 'xlsx']):
            response = self.post(
                client_name='Client Rice', code=f'T-{i}',
                loi=self.upload(f'l.{ext}'), specs=self.upload(f's.{ext}'),
            )
            self.assertEqual(response.status_code, 201, response.data)

    def test_files_survive_product_code_change(self):
        self.post(client_name='Client Rice', loi=self.upload('l.pdf'), specs=self.upload('s.jpg'))
        product = TradeProduct.objects.get()
        loi, specs = product.loi.name, product.specs.name
        response = self.client.put(
            f'/trademgt/trades/{product.trade_id}/',
            self.payload(client_name='Client Rice', code='P-RENAMED', id=product.id),
            format='multipart',
        )
        self.assertEqual(response.status_code, 200, response.data)
        updated = TradeProduct.objects.get()
        self.assertEqual(updated.product_code, 'P-RENAMED')
        self.assertEqual((updated.loi.name, updated.specs.name), (loi, specs))

    def test_update_cannot_drop_loi_requirement(self):
        self.post(client_name='NA', specs=self.upload('s.pdf'))
        product = TradeProduct.objects.get()
        response = self.client.put(
            f'/trademgt/trades/{product.trade_id}/',
            self.payload(client_name='Client Rice', id=product.id), format='multipart',
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('LOI is required', response.data['error'])
        self.assertTrue(TradeProduct.objects.filter(id=product.id).exists())
