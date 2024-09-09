from django.db import models
from django.utils.translation import gettext_lazy as _

# Create your models here.
class Trade(models.Model):
    company=models.CharField(_("company"), max_length=100)
    trd=models.DateField(_("trd"), auto_now=False, auto_now_add=False)
    trn=models.CharField(_("trn"), max_length=50)
    trade_type=models.CharField(_("trade_type"), max_length=50)
    trade_category = models.CharField(_("trade_category"), max_length=50)
    # product_code =  models.CharField(_("product_code"), max_length=50)
    # product_name = models.CharField(_("product_name"), max_length=50)
    # product_name_for_client=models.CharField(_("product_name_for_client"), max_length=50)
    # loi=models.FileField(_("loi"), upload_to=None, max_length=100)
    country_of_origin=models.CharField(_("country_of_origin"), max_length=50)
    customer_company_name=models.CharField(_("customer_company_name"), max_length=50)
    address=models.CharField(_("address"), max_length=100)
    # total_contract_qty=models.FloatField(_("total_contract_qty"))
    # total_contract_qty_unit=models.CharField(_("total_contract_qty_unit"), max_length=15)
    # tolerance=models.FloatField(_("tolerance"))
    packing=models.CharField(_("packing"), max_length=25)
    cost_of_packing_per_each=models.FloatField(_("cost_of_packing_per_each"))
    total_packing_cost=models.FloatField(_("total_packing_cost"))
    packaging_supplier=models.CharField(_("packaging_supplier"), max_length=100)
    # contract_balance_qty=models.FloatField(_("contract_balance_qty"))
    # contract_balance_qty_unit=models.CharField(_("contract_balance_qty_unit"), max_length=15)
    # trade_qty=models.FloatField(_("trade_qty"))
    # trade_qty_unit=models.CharField(_("trade_qty_unit"), max_length=15)
    # selected_currency_rate=models.FloatField(_("selected_currency_rate"))
    currency_selection=models.CharField(_("currency_selection"), max_length=15)
    exchange_rate=models.FloatField(_("exchange_rate"))
    rate_in_usd=models.FloatField(_("rate_in_usd"))
    commission_agent=models.CharField(_("commission_agent"), max_length=50)
    contract_value=models.FloatField(_("contract_value"))
    payment_term=models.CharField(_("payment_term"), max_length=100)
    advance_value_to_receive=models.FloatField(_("advance_value_to_receive"))
    commission_rate=models.FloatField(_("commission_rate"))
    logistic_provider=models.CharField(_("logistic_provider"), max_length=100)
    estimated_logistic_cost=models.FloatField(_("estimated_logistic_cost"))
    logistic_cost_tolerence=models.FloatField(_("logistic_cost_tolerence"))
    logistic_cost_remarks=models.CharField(_("logistic_cost_remarks"), max_length=100)
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
    markings_in_packaging=models.CharField(_("markings_in_packaging"), max_length=100)
    
    container_shipment_size=models.CharField(_("container_shipment_size"), max_length=50)
    bl_fee=models.FloatField(_("bl_fee"))
    bl_fee_remarks=models.CharField(_("bl_fee_remarks"), max_length=150)

    approved=models.BooleanField(_("approved"),default=False)

    approved_by=models.CharField(_("approved_by"), max_length=50, null=True, blank=True)

    # Self-referential many-to-many relationship (symmetrical)
    related_trades = models.ManyToManyField('self', blank=True, symmetrical=True, related_name='related_trades')

    class Meta:
        verbose_name = _("Trade")
        verbose_name_plural = _("Trades")

    def __str__(self):
        return self.trn

    def get_absolute_url(self):
        return reverse("Trade_detail", kwargs={"pk": self.pk})

class TradeProduct(models.Model):
    trade = models.ForeignKey(Trade, related_name='trade_products', on_delete=models.CASCADE)
    product_code =  models.CharField(_("product_code"), max_length=50)
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
        return self.trade

    def get_absolute_url(self):
        return reverse("TradeExtraCost_detail", kwargs={"pk": self.pk})


class PaymentTerm(models.Model):
    name=models.CharField(_("name"), max_length=100)
    advance_in_percentage=models.FloatField(_("advance_in_percentage"))
    advance_within=models.IntegerField(_("advance_within"))
    payment_within=models.IntegerField(_("payment_within"))

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
    payment_term=models.CharField(_("payment_term"), max_length=100)
    advance_due_date=models.DateField(_("advance_due_date"), auto_now=False, auto_now_add=False)
    lc_due_date=models.DateField(_("lc_due_date"), auto_now=False, auto_now_add=False)
    remarks=models.CharField(_("payment_term"), max_length=100)

    class Meta:
        verbose_name = _("PreSalePurchase")
        verbose_name_plural = _("PreSalePurchases")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("PreSalePurchase_detail", kwargs={"pk": self.pk})

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
    adv_due_date=models.DateField(_("adv_due_date"), auto_now=False, auto_now_add=False,null=True)
    as_per_pi_advance=models.CharField(_("as_per_pi_advance"), max_length=50)
    lc_number=models.CharField(_("lc_number"), max_length=50)
    lc_opening_bank=models.CharField(_("lc_opening_bank"), max_length=100)
    advance_received=models.FloatField(_("advance_received"))
    date_of_receipt=models.CharField(_("date_of_receipt"), max_length=50)
    advance_paid=models.FloatField(_("advance_paid"))
    date_of_payment=models.CharField(_("date_of_payment"), max_length=50)
    lc_expiry_date=models.CharField(_("lc_expiry_date"), max_length=50)
    latest_shipment_date_in_lc=models.CharField(_("lc_expiry_date"), max_length=50)
    remarks=models.CharField(_("lc_expiry_date"), max_length=100)

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
    commission_value=models.FloatField(_("commission_value"))
    bl_number=models.CharField(_("bl_number"), max_length=50)
    bl_qty=models.FloatField(_("bl_qty"))
    bl_fees=models.FloatField(_("bl_fees"))
    bl_collection_cost=models.FloatField(_("bl_collection_cost"))
    bl_date=models.DateField(_("bl_date"), auto_now=False, auto_now_add=False)
    total_packing_cost=models.FloatField(_("total_packing_cost"))
    packaging_supplier=models.CharField(_("packaging_supplier"), max_length=50)
    logistic_supplier=models.CharField(_("logistic_supplier"), max_length=50)
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
    

    class Meta:
        verbose_name = _("SalesPurchase")
        verbose_name_plural = _("SalesPurchases")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("SalePurchase_detail", kwargs={"pk": self.pk})

class SalesPurchaseProduct(models.Model):
    sp = models.ForeignKey(SalesPurchase, related_name='sp_product', on_delete=models.CASCADE)
    # product_code =  models.CharField(_("product_code"), max_length=50)
    product_name = models.CharField(_("product_name"), max_length=50)
    hs_code=models.CharField(_("hs_code"), max_length=50)
    tolerance=models.FloatField(_("tolerance"))
    batch_number=models.CharField(_("batch_number"), max_length=50)
    production_date=models.DateField(_("production_date"))
    trade_qty=models.FloatField(_("trade_qty"))
    trade_qty_unit=models.CharField(_("trade_qty_unit"), max_length=15)
   
    class Meta:
        verbose_name = _("SalesPurchaseProduct")
        verbose_name_plural = _("SalesPurchaseProducts")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("SalesPurchaseProduct_detail", kwargs={"pk": self.pk})

class SalesPurchaseExtraCharge(models.Model):
    sp=models.ForeignKey("SalesPurchase", verbose_name=_("sp"), on_delete=models.CASCADE)
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
    trn=models.ForeignKey("Trade", verbose_name=_("trn"), on_delete=models.CASCADE)
    balance_payment=models.FloatField(_("balance_payment"),null=True)
    balance_payment_received=models.FloatField(_("balance_payment_received"),null=True)
    balance_payment_made=models.FloatField(_("balance_payment_made"),null=True)
    balance_payment_date=models.DateField(_("balance_payment_date"), auto_now=False, auto_now_add=False)
    net_due_in_this_trade=models.FloatField(_("net_due_in_this_trade"),null=True)
    payment_mode=models.CharField(_("payment_mode"), max_length=50)
    status_of_payment=models.CharField(_("status_of_payment"), max_length=50)
    logistic_cost=models.FloatField(_("logistic_cost"),null=True)
    commission_value=models.FloatField(_("commission_value"),null=True)
    bl_fee=models.FloatField(_("bl_fee"),null=True)
    bl_collection_cost=models.FloatField(_("bl_collection_cost"),null=True)
    shipment_status=models.CharField(_("shipment_status"), max_length=50)
    release_docs=models.CharField(_("release_docs"), max_length=100)
    release_docs_date=models.CharField(_("release_docs_date"), max_length=50)
    remarks=models.CharField(_("remarks"), max_length=100)

    class Meta:
        verbose_name = _("PaymentFinance")
        verbose_name_plural = _("PaymentFinances")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("PaymentFinance_detail", kwargs={"pk": self.pk})

class TTCopy(models.Model):
    payment_finance=models.ForeignKey("PaymentFinance", verbose_name=_("payment_finance"), on_delete=models.CASCADE)
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
    payment_finance=models.ForeignKey("PaymentFinance", verbose_name=_("payment_finance"), on_delete=models.CASCADE)
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



class PurchaseProductTrace(models.Model):
    product_code=models.CharField(max_length=100)
    total_contract_qty=models.FloatField(null=True)
    trade_qty=models.FloatField(null=True)
    contract_balance_qty=models.FloatField(null=True)
    first_trn=models.CharField(max_length=15,null=True,blank=True)
    

    class Meta:
        verbose_name = _("PurchaseProductTrace")
        verbose_name_plural = _("PurchaseProductTraces")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("PurchaseProductTrace_detail", kwargs={"pk": self.pk})


class SalesProductTrace(models.Model):
    product_code=models.CharField(max_length=100)
    total_contract_qty=models.FloatField(null=True)
    trade_qty=models.FloatField(null=True)
    contract_balance_qty=models.FloatField(null=True)
    first_trn=models.CharField(max_length=15,null=True,blank=True)
    

    class Meta:
        verbose_name = _("SalesProductTrace")
        verbose_name_plural = _("SalesProductTraces")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("SalesProductTrace_detail", kwargs={"pk": self.pk})


class PurchasePending(models.Model):
    trn=models.ForeignKey(Trade, related_name='purchase_pending_product', on_delete=models.CASCADE)
    trd=models.DateField(_("trd"), auto_now=False, auto_now_add=False)
    company=models.CharField(_("company"), max_length=50)
    payment_term=models.CharField(_("company"), max_length=50)
    product_code=models.CharField(_("product_code"), max_length=50)
    product_name=models.CharField(_("product_code"), max_length=50)
    hs_code=models.CharField(_("product_code"), max_length=50)
    total_contract_qty=models.FloatField(_("total_contract_qty"))
    total_contract_qty_unit=models.CharField(_("total_contract_qty_unit"), max_length=15)
    contract_balance_qty=models.FloatField(_("contract_balance_qty"))
    contract_balance_qty_unit=models.CharField(_("contract_balance_qty_unit"), max_length=15)
    trade_qty=models.FloatField(_("total_contract_qty"))
    trade_qty_unit=models.CharField(_("total_contract_qty_unit"), max_length=15)
    
    

    class Meta:
        verbose_name = _("PurchasePending")
        verbose_name_plural = _("PurchasePendings")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("PurchasePending_detail", kwargs={"pk": self.pk})


class SalesPending(models.Model):
    trn=models.ForeignKey(Trade, related_name='sales_pending_product', on_delete=models.CASCADE)
    trd=models.DateField(_("trd"), auto_now=False, auto_now_add=False)
    company=models.CharField(_("company"), max_length=50)
    payment_term=models.CharField(_("company"), max_length=50)
    product_code=models.CharField(_("product_code"), max_length=50)
    product_name=models.CharField(_("product_code"), max_length=50)
    hs_code=models.CharField(_("product_code"), max_length=50)
    total_contract_qty=models.FloatField(_("total_contract_qty"))
    total_contract_qty_unit=models.CharField(_("total_contract_qty_unit"), max_length=15)
    contract_balance_qty=models.FloatField(_("contract_balance_qty"))
    contract_balance_qty_unit=models.CharField(_("contract_balance_qty_unit"), max_length=15)
    trade_qty=models.FloatField(_("total_contract_qty"))
    trade_qty_unit=models.CharField(_("total_contract_qty_unit"), max_length=15)

    class Meta:
        verbose_name = _("SalesPending")
        verbose_name_plural = _("SalesPendings")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("SalesPending_detail", kwargs={"pk": self.pk})


class Company(models.Model):
    name = models.CharField(max_length=255)
    initial = models.CharField(max_length=10)  # e.g., "KP", "SP", etc.
    counter = models.PositiveIntegerField(default=0)

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
    production_date=models.DateField(_("production_date"), auto_now=False, auto_now_add=False)
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


