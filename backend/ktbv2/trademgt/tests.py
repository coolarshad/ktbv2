from django.test import TestCase
from datetime import date
from trademgt.models import Trade, TradeProduct, TradePending
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

