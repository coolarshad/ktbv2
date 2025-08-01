from django.db import models, transaction
from django.utils.translation import gettext_lazy as _
from django.urls import reverse
import logging

logger = logging.getLogger(__name__)

# Create your models here.
class Trade(models.Model):
    TRADE_TYPES = [('Sales', 'Sales'), ('Purchase', 'Purchase')]
    
    company=models.CharField(_("company"), max_length=100)
    trd=models.DateField(_("trd"), auto_now=False, auto_now_add=False)  #actual trade entry date
    trn=models.CharField(_("trn"), max_length=50)
    trade_type = models.CharField(_("trade_type"), max_length=10, choices=TRADE_TYPES)
    trade_category = models.CharField(_("trade_category"), max_length=50)
    country_of_origin=models.CharField(_("country_of_origin"), max_length=50)
    customer_company_name=models.CharField(_("customer_company_name"), max_length=50)
    address=models.CharField(_("address"), max_length=100)
    
    currency_selection=models.CharField(_("currency_selection"), max_length=15)
    exchange_rate=models.FloatField(_("exchange_rate"))
   
    commission_agent=models.CharField(_("commission_agent"), max_length=50)
    contract_value=models.FloatField(_("contract_value"))
    payment_term=models.CharField(_("payment_term"), max_length=100)
    advance_value_to_receive=models.FloatField(_("advance_value_to_receive"))
    
    commission_value=models.FloatField(_("commission_value"))
    logistic_provider=models.CharField(_("logistic_provider"), max_length=100)
    estimated_logistic_cost=models.FloatField(_("estimated_logistic_cost"))
    logistic_cost_tolerence=models.FloatField(_("logistic_cost_tolerence"))
    # logistic_cost_remarks=models.CharField(_("logistic_cost_remarks"), max_length=100)
    bank_name_address=models.CharField(_("bank_name_address"), max_length=100)
    account_number=models.CharField(_("account_number"), max_length=50)
    swift_code=models.CharField(_("swift_code"), max_length=50)
    incoterm=models.CharField(_("incoterm"), max_length=50)
    pod=models.CharField(_("pod"), max_length=50)
    pol=models.CharField(_("pol"), max_length=50)
    eta=models.CharField(_("eta"), max_length=50)
    etd=models.CharField(_("etd"), max_length=50)
    remarks=models.CharField(_("remarks"), max_length=150)
    trader_name=models.CharField(_("trader_name"), max_length=150)
    insurance_policy_number=models.CharField(_("insurance_policy_number"), max_length=50)

    # bl_declaration=models.CharField(_("bl_declaration"), max_length=100)
    shipper_in_bl=models.CharField(_("shipper_in_bl"), max_length=50)
    consignee_in_bl=models.CharField(_("consignee_in_bl"), max_length=50)
    notify_party_in_bl=models.CharField(_("notify_party_in_bl"), max_length=50)
    # markings_in_packaging=models.CharField(_("markings_in_packaging"), max_length=100)
    
    # container_shipment_size=models.CharField(_("container_shipment_size"), max_length=50)
    bl_fee=models.FloatField(_("bl_fee"))
    bl_fee_remarks=models.CharField(_("bl_fee_remarks"), max_length=150)

    approved=models.BooleanField(_("approved"),default=False)
    reviewed=models.BooleanField(_("reviewed"),default=False)
    approval_date = models.DateField(_("approval date"), auto_now=False, auto_now_add=False, null=True, blank=True) #actual trade ref date
    approved_by=models.CharField(_("approved_by"), max_length=50, null=True, blank=True)
    reviewed_by=models.CharField(_("reviewed_by"), max_length=50, null=True, blank=True)

    # Self-referential many-to-many relationship (symmetrical)
    # related_trades = models.ManyToManyField('self', blank=True, symmetrical=True, related_name='related_trades')

    class Meta:
        verbose_name = _("Trade")
        verbose_name_plural = _("Trades")

    def __str__(self):
        return self.trn

    def get_absolute_url(self):
        return reverse("Trade_detail", kwargs={"pk": self.pk})

class TradeProduct(models.Model):
    trade = models.ForeignKey(Trade, on_delete=models.CASCADE, related_name='trade_products')
    product_code = models.CharField(max_length=100)
    product_name = models.CharField(_("product_name"), max_length=50)
    product_name_for_client=models.CharField(_("product_name_for_client"), max_length=50)
    loi=models.FileField(_("loi"), upload_to='uploads/lois', max_length=100)
    hs_code=models.CharField(_("hs_code"), max_length=50)
    total_contract_qty=models.FloatField(_("total_contract_qty"))
    total_contract_qty_unit=models.CharField(_("total_contract_qty_unit"), max_length=15)
    tolerance=models.FloatField(_("tolerance"))
    contract_balance_qty=models.FloatField(_("contract_balance_qty"))
    contract_balance_qty_unit=models.CharField(_("contract_balance_qty_unit"), max_length=15)
    trade_qty=models.FloatField(_("trade_qty"))
    trade_qty_unit=models.CharField(_("trade_qty_unit"), max_length=15)
    selected_currency_rate=models.FloatField(_("selected_currency_rate"))
    rate_in_usd=models.FloatField(_("rate_in_usd"))
    product_value=models.FloatField(_("product_value"))
    markings_in_packaging=models.CharField(_("markings_in_packaging"), max_length=100)
    packaging_supplier=models.CharField(_("packaging_supplier"), max_length=100)
    mode_of_packing=models.CharField(_("mode_of_packing"), max_length=25)
    rate_of_each_packing=models.FloatField(_("rate_of_each_packing"))
    qty_of_packing=models.FloatField(_("qty_of_packing"))
    total_packing_cost=models.FloatField(_("total_packing_cost"))
    commission_rate=models.FloatField(_("commission_rate"))
    total_commission=models.FloatField(_("total_commission"))
    # ref_type=models.CharField(_("ref_type"), max_length=50)
    ref_product_code=models.CharField(_("ref_product_code"), max_length=50)
    ref_trn=models.CharField(_("ref_trn"), max_length=50)
    logistic=models.FloatField(_("logistic"),null=True)
    logistic_remark=models.CharField(_("logistic_remark"), max_length=50)
    # product_code_ref=models.CharField(_("ref_trn"), max_length=50)
    container_shipment_size=models.CharField(_("container_shipment_size"), max_length=50)
    previous_trade_qty = models.FloatField(_("Previous Trade Quantity"), default=0)

    def save(self, *args, **kwargs):
        """Override save to handle trade quantity updates"""
        # previous_trade_qty is now set by the view before calling save
        try:
            if not hasattr(self, 'previous_trade_qty'):
                self.previous_trade_qty = 0
                print(f"No previous trade qty found for trade_id: {self.trade.id}, product_code: {self.product_code}")
            else:
                print(f"Using previous trade qty: {self.previous_trade_qty} for product_code: {self.product_code}")

            super().save(*args, **kwargs)
            self.update_product_trace()
            self.update_product_ref()
            self.create_trade_pending()
        except Exception as e:
            print(str(e))


    def update_product_trace(self):
        """Update or create TradeProductTrace for this product"""
        try:
            trace = TradeProductTrace.objects.get(
                product_code=self.product_code,
                trade_type=self.trade.trade_type
            )

            if hasattr(self, 'previous_trade_qty'):
                # For updates: add back the previous quantity and subtract the new quantity
                trace.contract_balance_qty += float(self.previous_trade_qty)
                trace.contract_balance_qty -= float(self.trade_qty)
            else:
                # For new records: just subtract the new quantity
                trace.contract_balance_qty -= float(self.trade_qty)
            
            trace.save()
            
        except TradeProductTrace.DoesNotExist:
            # Create new trace for first trade
            TradeProductTrace.objects.create(
                product_code=self.product_code,
                trade_type=self.trade.trade_type,
                total_contract_qty=float(self.total_contract_qty),
                contract_balance_qty=float(self.total_contract_qty) - float(self.trade_qty)
            )
        
    def update_product_ref(self):
        """Update or create TradeProductRef for this product"""
        try:
            trace = TradeProductRef.objects.get(
                product_code=self.product_code,
                trade_type=self.trade.trade_type
            )
            # if self.ref_trn!='NA':
            #     if hasattr(self, 'previous_trade_qty'):
            #         # For updates: add back the previous quantity and subtract the new quantity
            #         trace.ref_balance_qty += float(self.previous_trade_qty)
            #         trace.ref_balance_qty -= float(self.trade_qty)
            #     else:
            #         # For new records: just subtract the new quantity
            #         trace.ref_balance_qty -= float(self.trade_qty)
            if self.ref_trn!='NA':
                if hasattr(self, 'previous_trade_qty'):
                    trace.ref_balance_qty -= float(self.previous_trade_qty)
                    trace.ref_balance_qty += float(self.trade_qty)
            
            trace.save()
            
        except TradeProductRef.DoesNotExist:
            # Create new trace for first trade
            TradeProductRef.objects.create(
                product_code=self.product_code,
                trade_type=self.trade.trade_type,
                total_contract_qty=float(self.trade_qty),
                ref_balance_qty=float(self.trade_qty)
            )

    def create_trade_pending(self, old_value=None):
        """Create or update TradePending entry for this product"""
        # import pdb; pdb.set_trace()
        try:
            # Try to find an existing TradePending record
            pending = TradePending.objects.get(
            trn=self.trade,
            product_code=self.product_code,
            product_name=self.product_name,
            trade_type=self.trade.trade_type
            )
            # Recalculate adjusted balance using current trade_qty + tolerance
            
            try:
                base_qty = float(self.trade_qty)
                tolerance = float(self.tolerance)
                adjusted_balance_qty = base_qty + (tolerance / 100) * base_qty
            except (TypeError, ValueError):
                adjusted_balance_qty = 0

            # Update balance qty
            if old_value:
                pending.balance_qty-=old_value
                # pending.balance_qty+=adjusted_balance_qty
            else:
                pending.balance_qty+=adjusted_balance_qty
         
            pending.save()

        except TradePending.DoesNotExist:
            # No existing record, create a new one using trade_qty as base
            try:
                base_qty = float(self.trade_qty)
                tolerance = float(self.tolerance)
                adjusted_balance_qty = base_qty + (tolerance / 100) * base_qty
                
            except (TypeError, ValueError):
                adjusted_balance_qty = 0  # fallback to prevent crash

            TradePending.objects.create(
                trn=self.trade,
                trade_type=self.trade.trade_type,
                trd=self.trade.trd,
                company=self.trade.company,
                payment_term=self.trade.payment_term,
                product_code=self.product_code,
                product_name=self.product_name,
                hs_code=self.hs_code,
                contract_qty=self.total_contract_qty,  # trade_qty used as contract_qty
                contract_qty_unit=self.total_contract_qty_unit,
                balance_qty=adjusted_balance_qty,
                balance_qty_unit=self.contract_balance_qty_unit,
                selected_currency_rate=self.selected_currency_rate,
                rate_in_usd=self.rate_in_usd,
                tolerance=self.tolerance,
                logistic=self.logistic
            )



    class Meta:
        verbose_name = _("TradeProduct")
        verbose_name_plural = _("TradeProducts")

    def __str__(self):
        return self.product_code

    def get_absolute_url(self):
        return reverse("TradeProduct_detail", kwargs={"pk": self.pk})

class TradeExtraCost(models.Model):
    trade = models.ForeignKey(Trade, related_name='trade_extra_costs', on_delete=models.CASCADE)
    extra_cost=models.FloatField(_("extra_cost"))
    extra_cost_remarks=models.CharField(_("extra_cost_remarks"), max_length=100)

    class Meta:
        verbose_name = _("TradeExtraCost")
        verbose_name_plural = _("TradeExtraCosts")

    def __str__(self):
        return self.extra_cost_remarks

    def get_absolute_url(self):
        return reverse("TradeExtraCost_detail", kwargs={"pk": self.pk})


class PaymentTerm(models.Model):
    name=models.CharField(_("name"), max_length=100)
    advance_in_percentage=models.FloatField(_("advance_in_percentage"))
    advance_within=models.CharField(_("advance_within"), max_length=100)
    advance_from=models.CharField(_("advance_from"), max_length=100)
    payment_within=models.CharField(_("payment_within"), max_length=100)
    payment_from=models.CharField(_("payment_from"), max_length=100)

    class Meta:
        verbose_name = _("PaymentTerm")
        verbose_name_plural = _("PaymentTerms")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("PaymentTerm_detail", kwargs={"pk": self.pk})


class PreSalePurchase(models.Model):
    trn=models.ForeignKey("Trade", verbose_name=_("trn"), on_delete=models.CASCADE)
    date=models.DateField(_("date"), auto_now=False, auto_now_add=False)
    # trn=models.CharField(_("trn"), max_length=50)
    doc_issuance_date=models.DateField(_("doc_issuance_date"), auto_now=False, auto_now_add=False)
    # payment_term=models.CharField(_("payment_term"), max_length=100)
    # advance_due_date=models.DateField(_("advance_due_date"), auto_now=False, auto_now_add=False)
    # lc_due_date=models.DateField(_("lc_due_date"), auto_now=False, auto_now_add=False)
    remarks=models.CharField(_("payment_term"), max_length=100)
    approved=models.BooleanField(_("approved"),default=False)

    class Meta:
        verbose_name = _("PreSalePurchase")
        verbose_name_plural = _("PreSalePurchases")

    def __str__(self):
        return self.trn.trn

    def get_absolute_url(self):
        return reverse("PreSalePurchase_detail", kwargs={"pk": self.pk})

class PreDocument(models.Model):
    presalepurchase=models.ForeignKey("PreSalePurchase", verbose_name=_("presalepurchase"), on_delete=models.CASCADE)
    name=models.CharField(_("name"), max_length=50)

    class Meta:
        verbose_name = _("PreDocument")
        verbose_name_plural = _("PreDocuments")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("PreDocument_detail", kwargs={"pk": self.pk})

class AcknowledgedPI(models.Model):
    presalepurchase=models.ForeignKey("PreSalePurchase", verbose_name=_("presalepurchase"), on_delete=models.CASCADE)
    ackn_pi=models.FileField(_("ackn_pi"), upload_to='uploads/ackn_pi', max_length=100)
    ackn_pi_name=models.CharField(_("ackn_pi_name"), max_length=50)

    class Meta:
        verbose_name = _("AcknowledgedPI")
        verbose_name_plural = _("AcknowledgedPIs")

    def __str__(self):
        return self.ackn_pi_name

    def get_absolute_url(self):
        return reverse("AcknowledgedPI_detail", kwargs={"pk": self.pk})


class AcknowledgedPO(models.Model):
    presalepurchase=models.ForeignKey("PreSalePurchase", verbose_name=_("presalepurchase"), on_delete=models.CASCADE)
    ackn_po=models.FileField(_("ackn_po"), upload_to='uploads/ackn_po', max_length=100)
    ackn_po_name=models.CharField(_("ackn_po_name"), max_length=50)

    class Meta:
        verbose_name = _("AcknowledgedPO")
        verbose_name_plural = _("AcknowledgedPOs")

    def __str__(self):
        return self.ackn_po_name

    def get_absolute_url(self):
        return reverse("AcknowledgedPO_detail", kwargs={"pk": self.pk})


class DocumentsRequired(models.Model):
    name=models.CharField(_("name"), max_length=50)
    

    class Meta:
        verbose_name = _("DocumentsRequired")
        verbose_name_plural = _("DocumentsRequireds")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("DocumentsRequired_detail", kwargs={"pk": self.pk})


class PrePayment(models.Model):
    trn=models.ForeignKey("Trade", verbose_name=_("trn"), on_delete=models.CASCADE)
    # adv_due_date=models.CharField(_("adv_due_date"), max_length=50)
    # as_per_pi_advance=models.CharField(_("as_per_pi_advance"), max_length=50)
    lc_number=models.CharField(_("lc_number"), max_length=50)
    lc_opening_bank=models.CharField(_("lc_opening_bank"), max_length=100)
    advance_received=models.FloatField(_("advance_received"))
    date_of_receipt=models.CharField(_("date_of_receipt"), max_length=50)
    advance_paid=models.FloatField(_("advance_paid"))
    date_of_payment=models.CharField(_("date_of_payment"), max_length=50)
    lc_expiry_date=models.CharField(_("lc_expiry_date"), max_length=50)
    latest_shipment_date_in_lc=models.CharField(_("lc_expiry_date"), max_length=50)
    remarks=models.CharField(_("lc_expiry_date"), max_length=100)
    reviewed=models.BooleanField(_("reviewed"),default=False)
    advance_amount=models.FloatField(_("advance_amount"),null=True,default=0)

    class Meta:
        verbose_name = _("PrePayment")
        verbose_name_plural = _("PrePayments")

    def __str__(self):
        return self.trn

    def get_absolute_url(self):
        return reverse("PrePayment_detail", kwargs={"pk": self.pk})


class LcCopy(models.Model):
    prepayment=models.ForeignKey("PrePayment", verbose_name=_("prepayment"), on_delete=models.CASCADE)
    name=models.CharField(_("name"), max_length=50)
    lc_copy=models.FileField(_("lc_copy"), upload_to='uploads/lc_copy', max_length=100)
    

    class Meta:
        verbose_name = _("LcCopy")
        verbose_name_plural = _("LcCopys")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("LcCopy_detail", kwargs={"pk": self.pk})


class LcAmmendment(models.Model):
    prepayment=models.ForeignKey("PrePayment", verbose_name=_("prepayment"), on_delete=models.CASCADE)
    name=models.CharField(_("name"), max_length=50)
    lc_ammendment=models.FileField(_("lc_ammendment"), upload_to='uploads/lc_amend', max_length=100)
    

    class Meta:
        verbose_name = _("LcAmmendment")
        verbose_name_plural = _("LcAmmendments")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("LcAmmendment_detail", kwargs={"pk": self.pk})

class AdvanceTTCopy(models.Model):
    prepayment=models.ForeignKey("PrePayment", verbose_name=_("prepayment"), on_delete=models.CASCADE)
    name=models.CharField(_("name"), max_length=50)
    advance_tt_copy=models.FileField(_("advance_tt_copy"), upload_to='uploads/advance_tt_copy', max_length=100)
    

    class Meta:
        verbose_name = _("AdvanceTTCopy")
        verbose_name_plural = _("AdvanceTTCopys")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("AdvanceTTCopy_detail", kwargs={"pk": self.pk})


class SalesPurchase(models.Model):
    trn=models.ForeignKey("Trade", verbose_name=_("trn"), on_delete=models.CASCADE)
    invoice_date=models.DateField(_("invoice_date"), auto_now=False, auto_now_add=False)
    invoice_number=models.CharField(_("invoice_number"), max_length=50)
    invoice_amount=models.FloatField(_("invoice_amount"))
    # commission_value=models.FloatField(_("commission_value"))
    bl_number=models.CharField(_("bl_number"), max_length=50)
    # bl_qty=models.FloatField(_("bl_qty"))
    bl_fees=models.FloatField(_("bl_fees"))
    bl_collection_cost=models.FloatField(_("bl_collection_cost"))
    bl_date=models.DateField(_("bl_date"), auto_now=False, auto_now_add=False)
    # total_packing_cost=models.FloatField(_("total_packing_cost"))
    # packaging_supplier=models.CharField(_("packaging_supplier"), max_length=50)
    # logistic_supplier=models.CharField(_("logistic_supplier"), max_length=50)
    # batch_number=models.CharField(_("batch_number"), max_length=50)
    # production_date=models.DateField(_("production_date"))
    logistic_cost=models.FloatField(_("logistic_cost"))
    logistic_cost_due_date=models.CharField(_("logistic_cost_due_date"), max_length=50)
    liner=models.CharField(_("liner"), max_length=50)
    pod=models.CharField(_("pod"), max_length=50)
    pol=models.CharField(_("pol"), max_length=50)
    etd=models.DateField(_("etd"), auto_now=False, auto_now_add=False)
    eta=models.DateField(_("eta"), auto_now=False, auto_now_add=False)
    shipment_status=models.CharField(_("shipment_status"), max_length=50)
    remarks=models.CharField(_("remarks"), max_length=50)
    reviewed=models.BooleanField(_("reviewed"),default=False)
    

    class Meta:
        verbose_name = _("SalesPurchase")
        verbose_name_plural = _("SalesPurchases")

    def __str__(self):
        return self.invoice_number

    def get_absolute_url(self):
        return reverse("SalePurchase_detail", kwargs={"pk": self.pk})

class SalesPurchaseProduct(models.Model):
    sp = models.ForeignKey(SalesPurchase, related_name='sp_product', on_delete=models.CASCADE)
    # product_code =  models.CharField(_("product_code"), max_length=50)
    product_name = models.CharField(_("product_name"), max_length=50)
    hs_code=models.CharField(_("hs_code"), max_length=50)
    tolerance=models.FloatField(_("tolerance"))
    batch_number=models.CharField(_("batch_number"), max_length=50)
    production_date=models.CharField(_("production_date"), max_length=50)
    bl_qty=models.FloatField(_("bl_qty"))
    pending_qty=models.FloatField(_("bl_qty"))
    trade_qty_unit=models.CharField(_("trade_qty_unit"), max_length=15)
    bl_value=models.FloatField(_("bl_value"))
    product_code = models.CharField(_("product_code"), max_length=50)
    selected_currency_rate = models.FloatField(_("selected_currency_rate"))
    rate_in_usd = models.FloatField(_("selected_currency_rate"))
    logistic=models.FloatField(_("logistic"),null=True)


   
    class Meta:
        verbose_name = _("SalesPurchaseProduct")
        verbose_name_plural = _("SalesPurchaseProducts")

    def __str__(self):
        return self.product_code

    def get_absolute_url(self):
        return reverse("SalesPurchaseProduct_detail", kwargs={"pk": self.pk})

class SalesPurchaseExtraCharge(models.Model):
    sp=models.ForeignKey("SalesPurchase",related_name='sp_extra_charges', on_delete=models.CASCADE)
    name=models.CharField(_("name"), max_length=50)
    charge=models.FloatField(_("charge"),null=True, blank=True)
    

    class Meta:
        verbose_name = _("SalesPurchaseExtraCharge")
        verbose_name_plural = _("SalesPurchaseExtraCharges")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("SalesPurchaseExtraCharge_detail", kwargs={"pk": self.pk})

class PackingList(models.Model):
    sp=models.ForeignKey("SalesPurchase", verbose_name=_("sp"), on_delete=models.CASCADE)
    name=models.CharField(_("name"), max_length=50)
    packing_list=models.FileField(_("packing_list"), upload_to='uploads/sp_packing_list', max_length=100)

    class Meta:
        verbose_name = _("PackingList")
        verbose_name_plural = _("PackingLists")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("PackingList_detail", kwargs={"pk": self.pk})

class BL_Copy(models.Model):
    sp=models.ForeignKey("SalesPurchase", verbose_name=_("sp"), on_delete=models.CASCADE)
    name=models.CharField(_("name"), max_length=50)
    bl_copy=models.FileField(_("bl_copy"), upload_to='uploads/sp_bl_copy', max_length=100)

    class Meta:
        verbose_name = _("BL_Copy")
        verbose_name_plural = _("BL_Copys")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("BL_Copy_detail", kwargs={"pk": self.pk})


class Invoice(models.Model):
    sp=models.ForeignKey("SalesPurchase", verbose_name=_("sp"), on_delete=models.CASCADE)
    name=models.CharField(_("name"), max_length=50)
    invoice=models.FileField(_("invoice"), upload_to='uploads/sp_invoice', max_length=100)

    class Meta:
        verbose_name = _("Invoice")
        verbose_name_plural = _("Invoices")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("Invoice_detail", kwargs={"pk": self.pk})

class COA(models.Model):
    sp=models.ForeignKey("SalesPurchase", verbose_name=_("sp"), on_delete=models.CASCADE)
    name=models.CharField(_("name"), max_length=50)
    coa=models.FileField(_("coa"), upload_to='uploads/sp_coa', max_length=100)
    class Meta:
        verbose_name = _("COA")
        verbose_name_plural = _("COAs")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("COA_detail", kwargs={"pk": self.pk})



class PaymentFinance(models.Model):
    sp=models.ForeignKey("SalesPurchase",related_name='pfs', on_delete=models.CASCADE)
    # balance_payment=models.FloatField(_("balance_payment"),null=True)
    balance_payment_received=models.FloatField(_("balance_payment_received"),null=True)
    balance_payment_made=models.FloatField(_("balance_payment_made"),null=True)
    balance_payment_date=models.CharField(_("balance_payment_date"), max_length=100,blank=True,null=True)
    advance_adjusted=models.FloatField(_("advance_adjusted"),null=True,default=0)
    net_due_in_this_trade=models.FloatField(_("net_due_in_this_trade"),null=True)
    # payment_mode=models.CharField(_("payment_mode"), max_length=50)
    status_of_payment=models.CharField(_("status_of_payment"), max_length=50)
    # logistic_cost=models.FloatField(_("logistic_cost"),null=True)
    # commission_value=models.FloatField(_("commission_value"),null=True)
    # bl_fee=models.FloatField(_("bl_fee"),null=True)
    # bl_collection_cost=models.FloatField(_("bl_collection_cost"),null=True)
    # shipment_status=models.CharField(_("shipment_status"), max_length=50)
    release_docs=models.CharField(_("release_docs"), max_length=100)
    release_docs_date=models.CharField(_("release_docs_date"), max_length=50)
    remarks=models.CharField(_("remarks"), max_length=100)
    reviewed=models.BooleanField(_("reviewed"),default=False)
    date=models.DateField(_("date"), auto_now=False, auto_now_add=False)

    class Meta:
        verbose_name = _("PaymentFinance")
        verbose_name_plural = _("PaymentFinances")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("PaymentFinance_detail", kwargs={"pk": self.pk})

class TTCopy(models.Model):
    payment_finance=models.ForeignKey("PaymentFinance",related_name='pf_ttcopy', on_delete=models.CASCADE)
    name=models.CharField(_("name"), max_length=50)
    tt_copy=models.FileField(_("tt_copy"), upload_to='uploads/pf_tt_copy', max_length=100)

    class Meta:
        verbose_name = _("TTCopy")
        verbose_name_plural = _("TTCopys")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("TTCopy_detail", kwargs={"pk": self.pk})

class PFCharges(models.Model):
    payment_finance=models.ForeignKey("PaymentFinance",related_name='pf_charges', on_delete=models.CASCADE)
    name=models.CharField(_("name"), max_length=50)
    charge=models.FloatField(_("charge"),null=True,default=0)
    

    class Meta:
        verbose_name = _("PFCharges")
        verbose_name_plural = _("PFChargess")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("PFCharges_detail", kwargs={"pk": self.pk})


class Kyc(models.Model):
    date=models.CharField(max_length=255)
    name=models.CharField(max_length=255)
    companyRegNo=models.CharField(max_length=255)
    regAddress=models.CharField(max_length=255)
    mailingAddress=models.CharField(max_length=255)
    telephone=models.CharField(max_length=255)
    fax=models.CharField(max_length=255)
    person1=models.CharField(max_length=255)
    designation1=models.CharField(max_length=255)
    mobile1=models.CharField(max_length=255)
    email1=models.CharField(max_length=255)
    person2=models.CharField(max_length=255)
    designation2=models.CharField(max_length=255)
    mobile2=models.CharField(max_length=255)
    email2=models.CharField(max_length=255)
    banker=models.CharField(max_length=255, null=True,blank=True)
    address=models.CharField(max_length=255, null=True,blank=True)
    swiftCode=models.CharField(max_length=255, null=True,blank=True)
    accountNumber=models.CharField(max_length=255, null=True,blank=True)
    approve1=models.BooleanField(default=False)
    approve2=models.BooleanField(default=False)
    

    class Meta:
        verbose_name = _("Kyc")
        verbose_name_plural = _("Kycs")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("Kyc_detail", kwargs={"pk": self.pk})
    

class KycBankDetail(models.Model):
    kyc = models.ForeignKey(Kyc, related_name='bank_details', on_delete=models.CASCADE)
    banker = models.CharField(max_length=255, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    swiftCode = models.CharField(max_length=255, null=True, blank=True)
    accountNumber = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"{self.banker} - {self.accountNumber}"


class TradeProductTrace(models.Model):
    TRADE_TYPES = [('Sales', 'Sales'), ('Purchase', 'Purchase')]

    product_code = models.CharField(_("Product Code"), max_length=100)
    trade_type = models.CharField(_("Trade Type"), choices=TRADE_TYPES, max_length=10)
    total_contract_qty = models.FloatField(_("Total Contract Quantity"))
    contract_balance_qty = models.FloatField(_("Contract Balance Quantity"))
    # first_trn = models.CharField(_("First TRN"), max_length=15, null=True, blank=True)

    class Meta:
        unique_together = ("product_code", "trade_type")

    def __str__(self):
        return f"{self.trade_type} - {self.product_code}"

class TradeProductRef(models.Model):
    TRADE_TYPES = [('Sales', 'Sales'), ('Purchase', 'Purchase')]

    product_code = models.CharField(_("Product Code"), max_length=100)
    trade_type = models.CharField(_("Trade Type"), choices=TRADE_TYPES, max_length=10)
    total_contract_qty = models.FloatField(_("Total Contract Quantity"))
    ref_balance_qty = models.FloatField(_("Reference Balance Quantity"))
    # first_trn = models.CharField(_("First TRN"), max_length=15, null=True, blank=True)

    class Meta:
        unique_together = ("product_code", "trade_type")

    def __str__(self):
        return f"{self.trade_type} - {self.product_code}"

# class PurchaseProductTrace(models.Model):
#     product_code=models.CharField(max_length=100)
#     total_contract_qty=models.FloatField(null=True)
#     trade_qty=models.FloatField(null=True)
#     contract_balance_qty=models.FloatField(null=True)
#     ref_balance_qty=models.FloatField(null=True)
#     first_trn=models.CharField(max_length=15,null=True,blank=True)
    

#     class Meta:
#         verbose_name = _("PurchaseProductTrace")
#         verbose_name_plural = _("PurchaseProductTraces")

#     def __str__(self):
#         return self.product_code

#     def get_absolute_url(self):
#         return reverse("PurchaseProductTrace_detail", kwargs={"pk": self.pk})


# class SalesProductTrace(models.Model):
#     product_code=models.CharField(max_length=100)
#     total_contract_qty=models.FloatField(null=True)
#     trade_qty=models.FloatField(null=True)
#     contract_balance_qty=models.FloatField(null=True)
#     ref_balance_qty=models.FloatField(null=True)
#     first_trn=models.CharField(max_length=15,null=True,blank=True)
    

#     class Meta:
#         verbose_name = _("SalesProductTrace")
#         verbose_name_plural = _("SalesProductTraces")

#     def __str__(self):
#         return self.product_code

#     def get_absolute_url(self):
#         return reverse("SalesProductTrace_detail", kwargs={"pk": self.pk})

class TradePending(models.Model):
    TRADE_TYPES = [('Sales', 'Sales'), ('Purchase', 'Purchase')]

    trn = models.ForeignKey('Trade', related_name='trade_pending_products', on_delete=models.CASCADE)
    trade_type = models.CharField(_("Trade Type"), choices=TRADE_TYPES, max_length=10)
    trd = models.DateField(_("TRD"))
    company = models.CharField(_("Company"), max_length=50)
    payment_term = models.CharField(_("Payment Term"), max_length=50)
    product_code = models.CharField(_("Product Code"), max_length=50)
    product_name = models.CharField(_("Product Name"), max_length=50)
    hs_code = models.CharField(_("HS Code"), max_length=50)
    contract_qty = models.FloatField(_("Contract Quantity"))
    contract_qty_unit = models.CharField(_("Contract Quantity Unit"), max_length=15)
    balance_qty = models.FloatField(_("Balance Quantity"))
    balance_qty_unit = models.CharField(_("Balance Quantity Unit"), max_length=15)
    selected_currency_rate = models.FloatField(_("Selected Currency Rate"))
    rate_in_usd = models.FloatField(_("Rate in USD"))
    tolerance = models.FloatField(_("Tolerance"))
    logistic=models.FloatField(_("logistic"),null=True)

    class Meta:
        verbose_name = _("TradePending")
        verbose_name_plural = _("TradePendings")

    def __str__(self):
        return f"{self.trade_type} - {self.product_code}"

    def get_absolute_url(self):
        return reverse("TradePending_detail", kwargs={"pk": self.pk})
    
# class PurchasePending(models.Model):
#     trn=models.ForeignKey(Trade, related_name='purchase_pending_product', on_delete=models.CASCADE)
#     trd=models.DateField(_("trd"), auto_now=False, auto_now_add=False)
#     company=models.CharField(_("company"), max_length=50)
#     payment_term=models.CharField(_("company"), max_length=50)
#     product_code=models.CharField(_("product_code"), max_length=50)
#     product_name=models.CharField(_("product_code"), max_length=50)
#     hs_code=models.CharField(_("product_code"), max_length=50)
#     contract_qty=models.FloatField(_("contract_qty"))
#     contract_qty_unit=models.CharField(_("contract_qty_unit"), max_length=15)
#     balance_qty=models.FloatField(_("balance_qty"))
#     balance_qty_unit=models.CharField(_("balance_qty_unit"), max_length=15)
#     selected_currency_rate=models.FloatField(_("selected_currency_rate"))
#     rate_in_usd=models.FloatField(_("rate_in_usd"))
#     tolerance=models.FloatField(_("tolerance"))
    

#     class Meta:
#         verbose_name = _("PurchasePending")
#         verbose_name_plural = _("PurchasePendings")

#     def __str__(self):
#         return self.product_code

#     def get_absolute_url(self):
#         return reverse("PurchasePending_detail", kwargs={"pk": self.pk})


# class SalesPending(models.Model):
#     trn=models.ForeignKey(Trade, related_name='sales_pending_product', on_delete=models.CASCADE)
#     trd=models.DateField(_("trd"), auto_now=False, auto_now_add=False)
#     company=models.CharField(_("company"), max_length=50)
#     payment_term=models.CharField(_("company"), max_length=50)
#     product_code=models.CharField(_("product_code"), max_length=50)
#     product_name=models.CharField(_("product_code"), max_length=50)
#     hs_code=models.CharField(_("product_code"), max_length=50)
#     contract_qty=models.FloatField(_("contract_qty"))
#     contract_qty_unit=models.CharField(_("contract_qty_unit"), max_length=15)
#     balance_qty=models.FloatField(_("balance_qty"))
#     balance_qty_unit=models.CharField(_("balance_qty_unit"), max_length=15)
#     selected_currency_rate=models.FloatField(_("selected_currency_rate"))
#     rate_in_usd=models.FloatField(_("rate_in_usd"))
#     tolerance=models.FloatField(_("tolerance"))
    

#     class Meta:
#         verbose_name = _("SalesPending")
#         verbose_name_plural = _("SalesPendings")

#     def __str__(self):
#         return self.product_code

#     def get_absolute_url(self):
#         return reverse("SalesPending_detail", kwargs={"pk": self.pk})

# class PurchaseSPTracing(models.Model):
#     trn=models.ForeignKey(Trade, related_name='purchase_sp_tracing', on_delete=models.CASCADE)
#     product_code=models.CharField(_("product_code"), max_length=50)
#     product_name=models.CharField(_("product_code"), max_length=50)
#     hs_code=models.CharField(_("product_code"), max_length=50)
#     trade_qty=models.FloatField(_("total_contract_qty"))
#     trade_qty_unit=models.CharField(_("total_contract_qty_unit"), max_length=15)
#     bill_balance_qty=models.FloatField(null=True)
#     first_sp=models.CharField(max_length=15,null=True,blank=True)


#     class Meta:
#         verbose_name = _("PurchaseSPTracing")
#         verbose_name_plural = _("PurchaseSPTracings")

#     def __str__(self):
#         return self.product_name

#     def get_absolute_url(self):
#         return reverse("PurchaseSPTracing_detail", kwargs={"pk": self.pk})

# class SalesSPTracing(models.Model):
#     trn=models.ForeignKey(Trade, related_name='sales_sp_tracing', on_delete=models.CASCADE)
#     product_code=models.CharField(_("product_code"), max_length=50)
#     product_name=models.CharField(_("product_code"), max_length=50)
#     hs_code=models.CharField(_("product_code"), max_length=50)
#     trade_qty=models.FloatField(_("total_contract_qty"))
#     trade_qty_unit=models.CharField(_("total_contract_qty_unit"), max_length=15)
#     bill_balance_qty=models.FloatField(null=True)
#     first_sp=models.CharField(max_length=15,null=True,blank=True)


#     class Meta:
#         verbose_name = _("SalesSPTracing")
#         verbose_name_plural = _("SalesSPTracings")

#     def __str__(self):
#         return self.product_name

#     def get_absolute_url(self):
#         return reverse("SalesSPTracing_detail", kwargs={"pk": self.pk})

class Company(models.Model):
    name = models.CharField(max_length=255)
    address=models.CharField(max_length=255)
    initial = models.CharField(max_length=10)  # e.g., "KP", "SP", etc.
    counter = models.PositiveIntegerField(default=0)
    registration_number=models.CharField(max_length=20)
    seal_image = models.ImageField(upload_to='company/seals/', blank=True, null=True)
    signature_image = models.ImageField(upload_to='company/signatures/', blank=True, null=True)

    def __str__(self):
        return self.name
    
    def get_absolute_url(self):
        return reverse("Company_detail", kwargs={"pk": self.pk})

    def get_next_counter(self):
        """Returns the next counter value in the proper format without saving."""
        next_counter = self.counter + 1
        return f"{self.initial}-{next_counter:07d}"

    def save_counter(self, formatted_string):
        """Saves the counter based on the formatted string provided."""
        # Extract the counter from the formatted string
        try:
            prefix, counter_str = formatted_string.split('-')
            if prefix == self.initial:
                # Convert counter string to integer
                counter_value = int(counter_str)
                # Update the counter only if the provided counter is greater than the current one
                if counter_value > self.counter:
                    self.counter = counter_value
                    self.save()
                else:
                    raise ValueError("Provided counter is not greater than the current counter.")
            else:
                raise ValueError("Initials do not match.")
        except ValueError as e:
            raise ValueError(f"Invalid formatted string: {e}")

class Bank(models.Model):
    name=models.CharField(max_length=100)
    address=models.CharField(max_length=100)
    account_number=models.CharField(max_length=50)
    swift_code=models.CharField(max_length=100)
    

    class Meta:
        verbose_name = _("Bank")
        verbose_name_plural = _("Banks")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("Bank_detail", kwargs={"pk": self.pk})

class Unit(models.Model):
    name=models.CharField(max_length=50)
    

    class Meta:
        verbose_name = _("Unit")
        verbose_name_plural = _("Units")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("Unit_detail", kwargs={"pk": self.pk})

class Inventory(models.Model):
    product_name=models.CharField(_("product_name"), max_length=50)
    batch_number=models.CharField(_("batch_number"), max_length=50)
    production_date=models.CharField(_("production_date"), max_length=50,null=True,blank=True)
    quantity=models.FloatField(_("quantity"))
    unit=models.CharField(_("unit"), max_length=50)
    

    class Meta:
        verbose_name = _("Inventory")
        verbose_name_plural = _("Inventorys")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("Inventory_detail", kwargs={"pk": self.pk})

class ProductName(models.Model):
    name=models.CharField(_("name"), max_length=50)
    
    class Meta:
        verbose_name = _("ProductName")
        verbose_name_plural = _("ProductNames")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("ProductName_detail", kwargs={"pk": self.pk})

class ShipmentSize(models.Model):
    name=models.CharField(_("name"), max_length=50)
    
    class Meta:
        verbose_name = _("ShipmentSize")
        verbose_name_plural = _("ShipmentSizes")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("ShipmentSize_detail", kwargs={"pk": self.pk})

class Currency(models.Model):
    name=models.CharField(_("name"), max_length=50)

    class Meta:
        verbose_name = _("Currency")
        verbose_name_plural = _("Currencys")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("Currency_detail", kwargs={"pk": self.pk})

class Packing(models.Model):
    name=models.CharField(_("name"), max_length=50)
    

    class Meta:
        verbose_name = _("Packing")
        verbose_name_plural = _("Packings")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("Packing_detail", kwargs={"pk": self.pk})



class PL(models.Model):
    sales_trn=models.ForeignKey("SalesPurchase",related_name='sales_trn', verbose_name=_("sales_trn"), on_delete=models.CASCADE)
    purchase_trn=models.ForeignKey("SalesPurchase",related_name='purchase_trn', verbose_name=_("purchase_trn"), on_delete=models.CASCADE)
    remarks=models.CharField(_("100"), max_length=50)

    class Meta:
        verbose_name = _("PL")
        verbose_name_plural = _("PLs")

    def __str__(self):
        return self.sales_trn.id

    def get_absolute_url(self):
        return reverse("PL_detail", kwargs={"pk": self.pk})
