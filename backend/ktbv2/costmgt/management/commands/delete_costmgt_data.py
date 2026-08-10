from django.core.management.base import BaseCommand
from django.db import transaction
from costmgt.models import (
    FinalProductPackingItem,
    FinalProductAdditionalCost,
    FinalProduct,
    ProductFormulaItem,
    ProductFormula,
    ConsumptionBaseOil,
    ConsumptionAdditive,
    Consumption,
    ConsumptionFormulaBaseOil,
    ConsumptionFormulaAdditive,
    ConsumptionFormula,
    AdditiveExtra,
    Additive,
    AdditiveCategory,
    RMExtra,
    RawMaterial,
    RawCategory,
    PackingExtra,
    Packing,
)


class Command(BaseCommand):
    help = "Delete all records and associated child entities for cost management (costmgt) models."

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
                    "This command will delete ALL cost management records and their associated child entities!\n"
                    "Please re-run with --confirm flag to execute: python manage.py delete_costmgt_data --confirm"
                )
            )
            return

        self.stdout.write("Starting deletion of costmgt records in atomic transaction...")

        with transaction.atomic():
            # 1. Final Product Cost & Children
            count_fp_item, _ = FinalProductPackingItem.objects.all().delete()
            count_fp_cost, _ = FinalProductAdditionalCost.objects.all().delete()
            count_fp, _ = FinalProduct.objects.all().delete()
            self.stdout.write(f"Deleted FinalProductPackingItem ({count_fp_item}), FinalProductAdditionalCost ({count_fp_cost}), FinalProduct ({count_fp})")

            # 2. Packing Formulation & Children
            count_pf_item, _ = ProductFormulaItem.objects.all().delete()
            count_pf, _ = ProductFormula.objects.all().delete()
            self.stdout.write(f"Deleted ProductFormulaItem ({count_pf_item}), ProductFormula ({count_pf})")

            # 3. Consumption / Blending Cost & Children
            count_c_bo, _ = ConsumptionBaseOil.objects.all().delete()
            count_c_add, _ = ConsumptionAdditive.objects.all().delete()
            count_c, _ = Consumption.objects.all().delete()
            self.stdout.write(f"Deleted ConsumptionBaseOil ({count_c_bo}), ConsumptionAdditive ({count_c_add}), Consumption ({count_c})")

            # 4. Blending Formulation & Children
            count_cf_bo, _ = ConsumptionFormulaBaseOil.objects.all().delete()
            count_cf_add, _ = ConsumptionFormulaAdditive.objects.all().delete()
            count_cf, _ = ConsumptionFormula.objects.all().delete()
            self.stdout.write(f"Deleted ConsumptionFormulaBaseOil ({count_cf_bo}), ConsumptionFormulaAdditive ({count_cf_add}), ConsumptionFormula ({count_cf})")

            # 5. Additive Pricing & Children
            count_add_extra, _ = AdditiveExtra.objects.all().delete()
            count_add, _ = Additive.objects.all().delete()
            self.stdout.write(f"Deleted AdditiveExtra ({count_add_extra}), Additive ({count_add})")

            # 6. Additives Category
            count_add_cat, _ = AdditiveCategory.objects.all().delete()
            self.stdout.write(f"Deleted AdditiveCategory ({count_add_cat})")

            # 7. Raw Material Pricing & Children
            count_rm_extra, _ = RMExtra.objects.all().delete()
            count_rm, _ = RawMaterial.objects.all().delete()
            self.stdout.write(f"Deleted RMExtra ({count_rm_extra}), RawMaterial ({count_rm})")

            # 8. Raw Material Category
            count_rm_cat, _ = RawCategory.objects.all().delete()
            self.stdout.write(f"Deleted RawCategory ({count_rm_cat})")

            # 9. Packing Price & Children
            count_p_extra, _ = PackingExtra.objects.all().delete()
            count_p, _ = Packing.objects.all().delete()
            self.stdout.write(f"Deleted PackingExtra ({count_p_extra}), Packing ({count_p})")

        self.stdout.write(self.style.SUCCESS("Successfully deleted all costmgt records and their associated child entities!"))
