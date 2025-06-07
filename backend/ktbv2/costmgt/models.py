from django.db import models
from django.utils.translation import gettext_lazy as _
from django.urls import reverse
# Create your models here.

# class Packing(models.Model):
#     date=models.DateField(_("date"), auto_now=False, auto_now_add=False)
#     name=models.CharField(max_length=50)
#     per_each=models.FloatField()
#     category=models.CharField(max_length=50,blank=True,null=True)
#     remarks=models.CharField(max_length=255,null=True,blank=True)
#     approved=models.BooleanField(null=True,default=False)
    
#     class Meta:
#         verbose_name = _("Packing")
#         verbose_name_plural = _("Packings")
        
#     def __str__(self):
#         return self.name
    
#     def get_absolute_url(self):
#         return reverse("Packing_detail", kwargs={"pk": self.pk})

class Packing(models.Model):
    date = models.DateField(_("date"), auto_now=False, auto_now_add=False,null=True,blank=True)
    name = models.CharField(max_length=50)
    per_each = models.FloatField(null=True,blank=True)
    
    # Self-referential ForeignKey to establish parent-child hierarchy
    parent = models.ForeignKey(
        'self',  # References the same model
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subcategories'
    )
    packing_type=models.CharField(max_length=255,blank=True,null=True)
    remarks = models.CharField(max_length=255, null=True, blank=True)
    approved = models.BooleanField(null=True, default=False)

    class Meta:
        verbose_name = _("Packing")
        verbose_name_plural = _("Packings")

    def __str__(self):
        return f"{self.parent.name} -> {self.name}" if self.parent else self.name

# class RawMaterial(models.Model):
#     name=models.CharField(max_length=50)
#     cost_per_liter=models.FloatField()
#     buy_price_pmt=models.FloatField()
#     add_cost=models.FloatField()
#     total=models.FloatField()
#     ml_to_kl=models.FloatField()
#     density=models.FloatField()
#     remarks=models.CharField(max_length=255,null=True,blank=True)
#     approved=models.BooleanField(null=True,default=False)
    
#     class Meta:
#         verbose_name = _("RawMaterial")
#         verbose_name_plural = _("RawMaterials")
        
#     def __str__(self):
#         return self.name
    
#     def get_absolute_url(self):
#         return reverse("RawMaterial_detail", kwargs={"pk": self.pk})
class RawMaterial(models.Model):
    name = models.CharField(max_length=50)
    cost_per_liter = models.FloatField(null=True,blank=True)
    buy_price_pmt = models.FloatField(null=True,blank=True)
    add_cost = models.FloatField(null=True,blank=True)
    total = models.FloatField(null=True,blank=True)
    ml_to_kl = models.FloatField(null=True,blank=True)
    density = models.FloatField(null=True,blank=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subcategories'  # You could use 'subcategories' or another name
    )
    remarks = models.CharField(max_length=255, null=True, blank=True)
    approved = models.BooleanField(null=True, default=False)
    
    class Meta:
        verbose_name = _("RawMaterial")
        verbose_name_plural = _("RawMaterials")
        
    def __str__(self):
        return f"{self.parent.name} -> {self.name}" if self.parent else self.name
    
    def get_absolute_url(self):
        return reverse("RawMaterial_detail", kwargs={"pk": self.pk})


class Additive(models.Model):
    name=models.CharField(max_length=50)
    date=models.DateField(_("date"), auto_now=False, auto_now_add=False)
    crfPrice=models.FloatField()
    addCost=models.FloatField()
    costPriceInLiter=models.FloatField()
    density=models.FloatField()
    totalCost=models.FloatField()
    remarks=models.CharField(max_length=255,null=True,blank=True)
    approved=models.BooleanField(null=True,default=False)

    class Meta:
        verbose_name = _("Additive")
        verbose_name_plural = _("Additives")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("Additive_detail", kwargs={"pk": self.pk})


class ConsumptionFormula(models.Model):
    date=models.DateField(_("date"), auto_now=False, auto_now_add=False,null=True,blank=True)
    name=models.CharField(max_length=50)
    grade=models.CharField(max_length=50)
    sae=models.CharField(max_length=50)

    remarks=models.CharField(max_length=255,null=True,blank=True)
    approved=models.BooleanField(null=True,default=False)


    class Meta:
        verbose_name = _("Consumption")
        verbose_name_plural = _("Consumptions")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("Consumption_detail", kwargs={"pk": self.pk})

class ConsumptionFormulaAdditive(models.Model):
    consumption=models.ForeignKey(ConsumptionFormula,on_delete=models.CASCADE,null=True)
    name=models.CharField(max_length=50)
    qty_in_percent=models.FloatField()

    class Meta:
        verbose_name = _("ConsumptionFormulaAdditive")
        verbose_name_plural = _("ConsumptionFormulaAdditives")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("ConsumptionFormulaAdditive_detail", kwargs={"pk": self.pk})

class ConsumptionFormulaBaseOil(models.Model):
    consumption=models.ForeignKey(ConsumptionFormula,on_delete=models.CASCADE,null=True)
    name=models.CharField(max_length=50)
    qty_in_percent=models.FloatField()

    class Meta:
        verbose_name = _("ConsumptionFormulaBaseOil")
        verbose_name_plural = _("ConsumptionFormulaBaseOils")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("ConsumptionFormulaBaseOil_detail", kwargs={"pk": self.pk})
    

class Consumption(models.Model):
    date=models.DateField(_("date"), auto_now=False, auto_now_add=False,null=True,blank=True)
    name=models.CharField(max_length=50)
    grade=models.CharField(max_length=50)
    sae=models.CharField(max_length=50)
    net_blending_qty=models.FloatField()
    gross_vol_crosscheck=models.FloatField()
    cross_check=models.FloatField()
    total_value=models.FloatField(null=True,blank=True)
    per_litre_cost=models.FloatField()
    remarks=models.CharField(max_length=255,null=True,blank=True)
    approved=models.BooleanField(null=True,default=False)


    class Meta:
        verbose_name = _("Consumption")
        verbose_name_plural = _("Consumptions")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("Consumption_detail", kwargs={"pk": self.pk})

class ConsumptionAdditive(models.Model):
    consumption=models.ForeignKey(Consumption,on_delete=models.CASCADE,null=True)
    name=models.CharField(max_length=50)
    qty_in_percent=models.FloatField()
    qty_in_litre=models.FloatField()
    value=models.FloatField()


    class Meta:
        verbose_name = _("ConsumptionAdditive")
        verbose_name_plural = _("ConsumptionAdditives")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("ConsumptionAdditive_detail", kwargs={"pk": self.pk})

class ConsumptionBaseOil(models.Model):
    consumption=models.ForeignKey(Consumption,on_delete=models.CASCADE,null=True)
    name=models.CharField(max_length=50)
    qty_in_percent=models.FloatField()
    qty_in_litre=models.FloatField()
    value=models.FloatField()


    class Meta:
        verbose_name = _("ConsumptionBaseOil")
        verbose_name_plural = _("ConsumptionBaseOils")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("ConsumptionBaseOil_detail", kwargs={"pk": self.pk})

class FinalProduct(models.Model):
    date=models.DateField(_("date"), auto_now=False, auto_now_add=False)
    name=models.CharField(max_length=50,null=True,blank=True)
    packing_size=models.CharField(max_length=50,null=True,blank=True)
    bottles_per_pack=models.FloatField(null=True,blank=True)
    liters_per_pack=models.FloatField(null=True,blank=True)
    total_qty=models.FloatField(null=True,blank=True)
    total_qty_unit=models.CharField(max_length=50,null=True,blank=True)
    qty_in_liters=models.FloatField(null=True,blank=True)
    per_liter_cost=models.FloatField(null=True,blank=True)
    cost_per_case=models.FloatField(null=True,blank=True)
    dk_cost=models.FloatField(null=True,blank=True)
    price_per_bottle=models.CharField(_("price_per_bottle"), max_length=50)
    price_per_label=models.CharField(_("price_per_label"), max_length=50)
    price_per_bottle_cap=models.CharField(_("price_per_bottle_cap"), max_length=50)
    bottle_per_case=models.FloatField(_("bottle_per_case"))
    label_per_case=models.FloatField(_("label_per_case"))
    bottle_cap_per_case=models.FloatField(_("bottle_cap_per_case"))
    price_per_carton=models.CharField(_("price_per_carton"), max_length=50)
    dk_exprice=models.FloatField(null=True,blank=True)
    ks_cost=models.FloatField(null=True,blank=True)
    total_factory_price=models.FloatField(null=True,blank=True)
    freight_logistic=models.FloatField(null=True,blank=True)
    total_cif_price=models.FloatField(null=True,blank=True)
    remarks=models.CharField(max_length=50,null=True,blank=True)
    approved=models.BooleanField(null=True,default=False)

    class Meta:
        verbose_name = _("FinalProduct")
        verbose_name_plural = _("FinalProducts")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("FinalProduct_detail", kwargs={"pk": self.pk})

