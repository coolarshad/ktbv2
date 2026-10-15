import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import (
    TradeProduct,
    AcknowledgedPI,
    AcknowledgedPO,
    LcCopy,
    LcAmmendment,
    AdvanceTTCopy,
    PackingList,
    BL_Copy,
    Invoice,
    COA,
    TTCopy,
    Company
)
from .tasks import backup_file_to_gdrive_task

logger = logging.getLogger(__name__)

def _dispatch_backup(file_field, subfolder):
    from django.conf import settings
    if not getattr(settings, 'GOOGLE_DRIVE_AUTO_BACKUP', False):
        return

    if file_field and hasattr(file_field, 'name') and file_field.name:
        try:
            # Trigger celery task asynchronously
            backup_file_to_gdrive_task.delay(
                relative_file_path=file_field.name,
                subfolder_name=subfolder
            )
        except Exception as e:
            logger.error(f"[GDrive Signal] Failed to enqueue backup task for {file_field.name}: {e}")

@receiver(post_save, sender=TradeProduct)
def backup_trade_product_files(sender, instance, **kwargs):
    trn = getattr(getattr(instance, 'trade', None), 'trn', 'General_Trades')
    subfolder = f"{trn}/Trade_Products"
    if instance.loi:
        _dispatch_backup(instance.loi, f"{subfolder}/LOI")
    if instance.specs:
        _dispatch_backup(instance.specs, f"{subfolder}/Specs")

@receiver(post_save, sender=AcknowledgedPI)
def backup_ackn_pi(sender, instance, **kwargs):
    psp = getattr(instance, 'presalepurchase', None)
    trn = getattr(getattr(psp, 'trn', None), 'trn', 'Pre_Sale_Purchase')
    _dispatch_backup(instance.ackn_pi, f"{trn}/Acknowledged_PI")

@receiver(post_save, sender=AcknowledgedPO)
def backup_ackn_po(sender, instance, **kwargs):
    psp = getattr(instance, 'presalepurchase', None)
    trn = getattr(getattr(psp, 'trn', None), 'trn', 'Pre_Sale_Purchase')
    _dispatch_backup(instance.ackn_po, f"{trn}/Acknowledged_PO")

@receiver(post_save, sender=LcCopy)
def backup_lc_copy(sender, instance, **kwargs):
    pp = getattr(instance, 'prepayment', None)
    trn = getattr(getattr(pp, 'trn', None), 'trn', 'Pre_Payment')
    _dispatch_backup(instance.lc_copy, f"{trn}/LC_Copy")

@receiver(post_save, sender=LcAmmendment)
def backup_lc_amendment(sender, instance, **kwargs):
    pp = getattr(instance, 'prepayment', None)
    trn = getattr(getattr(pp, 'trn', None), 'trn', 'Pre_Payment')
    _dispatch_backup(instance.lc_ammendment, f"{trn}/LC_Amendments")

@receiver(post_save, sender=AdvanceTTCopy)
def backup_advance_tt(sender, instance, **kwargs):
    pp = getattr(instance, 'prepayment', None)
    trn = getattr(getattr(pp, 'trn', None), 'trn', 'Pre_Payment')
    _dispatch_backup(instance.advance_tt_copy, f"{trn}/Advance_TT")

@receiver(post_save, sender=PackingList)
def backup_packing_list(sender, instance, **kwargs):
    sp = getattr(instance, 'sp', None)
    trn = getattr(getattr(sp, 'trn', None), 'trn', 'Sales_Purchase')
    _dispatch_backup(instance.packing_list, f"{trn}/Packing_Lists")

@receiver(post_save, sender=BL_Copy)
def backup_bl_copy(sender, instance, **kwargs):
    sp = getattr(instance, 'sp', None)
    trn = getattr(getattr(sp, 'trn', None), 'trn', 'Sales_Purchase')
    _dispatch_backup(instance.bl_copy, f"{trn}/BL_Copies")

@receiver(post_save, sender=Invoice)
def backup_invoice(sender, instance, **kwargs):
    sp = getattr(instance, 'sp', None)
    trn = getattr(getattr(sp, 'trn', None), 'trn', 'Sales_Purchase')
    _dispatch_backup(instance.invoice, f"{trn}/Invoices")

@receiver(post_save, sender=COA)
def backup_coa(sender, instance, **kwargs):
    sp = getattr(instance, 'sp', None)
    trn = getattr(getattr(sp, 'trn', None), 'trn', 'Sales_Purchase')
    _dispatch_backup(instance.coa, f"{trn}/COA")

@receiver(post_save, sender=TTCopy)
def backup_pf_tt_copy(sender, instance, **kwargs):
    pf = getattr(instance, 'payment_finance', None)
    sp = getattr(pf, 'sp', None)
    trn = getattr(getattr(sp, 'trn', None), 'trn', 'Payment_Finance')
    _dispatch_backup(instance.tt_copy, f"{trn}/Payment_TT_Copies")

@receiver(post_save, sender=Company)
def backup_company_assets(sender, instance, **kwargs):
    subfolder = f"Company_Assets/{instance.name or 'Main'}"
    if instance.seal_image:
        _dispatch_backup(instance.seal_image, subfolder)
    if instance.signature_image:
        _dispatch_backup(instance.signature_image, subfolder)
