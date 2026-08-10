from django.core.management.base import BaseCommand
from django.db import transaction
from trademgt.models import (
    PL,
    Inventory,
    TTCopy,
    PFCharges,
    PaymentFinance,
    SalesPurchaseProduct,
    SalesPurchaseExtraCharge,
    PackingList,
    BL_Copy,
    Invoice,
    COA,
    SalesPurchase,
    LcCopy,
    LcAmmendment,
    AdvanceTTCopy,
    PrePayment,
    PreDocument,
    AcknowledgedPI,
    AcknowledgedPO,
    PreSalePurchase,
    TradePending,
    TradeProductTrace,
    TradeProductRef,
    TradeProduct,
    TradeExtraCost,
    Trade,
)


class Command(BaseCommand):
    help = "Delete all records and associated child entities for trade management (trademgt) models."

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm execution of deletion script.',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.WARNING(
                    "This command will delete ALL trade management records and their associated child entities!\n"
                    "Please re-run with --confirm flag to execute: python manage.py delete_trademgt_data --confirm"
                )
            )
            return

        self.stdout.write("Starting deletion of trademgt records in atomic transaction...")

        with transaction.atomic():
            # 1. P&L
            count_pl, _ = PL.objects.all().delete()
            self.stdout.write(f"Deleted PL ({count_pl})")

            # 2. Inventory
            count_inv, _ = Inventory.objects.all().delete()
            self.stdout.write(f"Deleted Inventory ({count_inv})")

            # 3. Payment Finance & Children
            count_tt, _ = TTCopy.objects.all().delete()
            count_pfc, _ = PFCharges.objects.all().delete()
            count_pf, _ = PaymentFinance.objects.all().delete()
            self.stdout.write(f"Deleted TTCopy ({count_tt}), PFCharges ({count_pfc}), PaymentFinance ({count_pf})")

            # 4. Sales Purchases & Children
            count_spp, _ = SalesPurchaseProduct.objects.all().delete()
            count_spe, _ = SalesPurchaseExtraCharge.objects.all().delete()
            count_pl_doc, _ = PackingList.objects.all().delete()
            count_bl, _ = BL_Copy.objects.all().delete()
            count_inv_doc, _ = Invoice.objects.all().delete()
            count_coa, _ = COA.objects.all().delete()
            count_sp, _ = SalesPurchase.objects.all().delete()
            self.stdout.write(f"Deleted SalesPurchase children and SalesPurchase ({count_sp})")

            # 5. Pre Payment & Children
            count_lc, _ = LcCopy.objects.all().delete()
            count_lcam, _ = LcAmmendment.objects.all().delete()
            count_adv_tt, _ = AdvanceTTCopy.objects.all().delete()
            count_pp, _ = PrePayment.objects.all().delete()
            self.stdout.write(f"Deleted LcCopy ({count_lc}), LcAmmendment ({count_lcam}), AdvanceTTCopy ({count_adv_tt}), PrePayment ({count_pp})")

            # 6. Pre-Sale Purchase & Children
            count_predoc, _ = PreDocument.objects.all().delete()
            count_ack_pi, _ = AcknowledgedPI.objects.all().delete()
            count_ack_po, _ = AcknowledgedPO.objects.all().delete()
            count_psp, _ = PreSalePurchase.objects.all().delete()
            self.stdout.write(f"Deleted PreDocument ({count_predoc}), AcknowledgedPI ({count_ack_pi}), AcknowledgedPO ({count_ack_po}), PreSalePurchase ({count_psp})")

            # 7. Trade Pending
            count_tp, _ = TradePending.objects.all().delete()
            self.stdout.write(f"Deleted TradePending ({count_tp})")

            # 8. Product Trace & Product Reference
            count_tptrace, _ = TradeProductTrace.objects.all().delete()
            count_tpref, _ = TradeProductRef.objects.all().delete()
            self.stdout.write(f"Deleted TradeProductTrace ({count_tptrace}), TradeProductRef ({count_tpref})")

            # 9. Trade Approval / Trade Approved & Children
            count_tprod, _ = TradeProduct.objects.all().delete()
            count_textra, _ = TradeExtraCost.objects.all().delete()
            count_trade, _ = Trade.objects.all().delete()
            self.stdout.write(f"Deleted TradeProduct ({count_tprod}), TradeExtraCost ({count_textra}), Trade ({count_trade})")

        self.stdout.write(self.style.SUCCESS("Successfully deleted all trademgt records and their associated child entities!"))
