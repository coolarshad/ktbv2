from django.db import models
from django.utils.translation import gettext_lazy as _
from django.urls import reverse
# Create your models here.


class Category(models.Model):
    name = models.CharField(max_length=100)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children'
    )

    class Meta:
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")
        ordering = ['-id']  

    def __str__(self):
        full_path = [self.name]
        k = self.parent
        while k is not None:
            full_path.append(k.name)
            k = k.parent
        return " -> ".join(full_path[::-1])  # Root → ... → SubCategory


class Packing(models.Model):
    date = models.DateField(_("date"), null=True, blank=True)
    name = models.CharField(max_length=50)
    per_each = models.FloatField(null=True, blank=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="packings"
    )
    packing_type = models.CharField(max_length=255, blank=True, null=True)
    remarks = models.CharField(max_length=255, null=True, blank=True)
    approved = models.BooleanField(null=True, default=False)

    class Meta:
        verbose_name = _("Packing")
        verbose_name_plural = _("Packings")
        ordering = ['-id'] 

    def __str__(self):
        return f"{self.category} -> {self.name}" if self.category else self.name
    

class PackingExtra(models.Model):
    packing = models.ForeignKey(
        "Packing", 
        on_delete=models.CASCADE,
        related_name="extras"  # ← add this
    )
    name = models.CharField(max_length=50)
    rate = models.FloatField(null=True, blank=True)



class RawCategory(models.Model):
    name = models.CharField(max_length=100)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children'
    )

    class Meta:
        verbose_name = _("RawCategory")
        verbose_name_plural = _("RawCategories")
        ordering = ['-id'] 

    def __str__(self):
        full_path = [self.name]
        k = self.parent
        while k is not None:
            full_path.append(k.name)
            k = k.parent
        return " -> ".join(full_path[::-1])  # Root → ... → SubCategory
    
class RawMaterial(models.Model):
    # name = models.CharField(max_length=50)
    date=models.DateField(_("date"), auto_now=False, auto_now_add=False)
    cost_per_liter = models.FloatField(null=True,blank=True)
    buy_price_pmt = models.FloatField(null=True,blank=True)
    add_cost = models.FloatField(null=True,blank=True)
    total = models.FloatField(null=True,blank=True)
    ml_to_kl = models.FloatField(null=True,blank=True)
    density = models.FloatField(null=True,blank=True)
    category = models.ForeignKey(
        RawCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="rawmaterials"
    )
    name = models.ForeignKey(
        RawCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="rawmaterials_name"
    )
    remarks = models.CharField(max_length=255, null=True, blank=True)
    approved = models.BooleanField(null=True, default=False)
    
    class Meta:
        verbose_name = _("RawMaterial")
        verbose_name_plural = _("RawMaterials")
        ordering = ['-id'] 
        
    def __str__(self):
        return f"{self.parent.name} -> {self.name}" if self.parent else self.name
    
    def get_absolute_url(self):
        return reverse("RawMaterial_detail", kwargs={"pk": self.pk})

class RMExtra(models.Model):
    rm = models.ForeignKey(
        "RawMaterial", 
        on_delete=models.CASCADE,
        related_name="extras"  # ← add this
    )
    name = models.CharField(max_length=50)
    rate = models.FloatField(null=True, blank=True)


class AdditiveCategory(models.Model):
    name = models.CharField(max_length=100)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children'
    )

    class Meta:
        verbose_name = _("AdditiveCategory")
        verbose_name_plural = _("AdditiveCategories")
        ordering = ['-id'] 

    def __str__(self):
        full_path = [self.name]
        k = self.parent
        while k is not None:
            full_path.append(k.name)
            k = k.parent
        return " -> ".join(full_path[::-1])  # Root → ... → SubCategory
    
class Additive(models.Model):
    # name=models.CharField(max_length=50)
    date=models.DateField(_("date"), auto_now=False, auto_now_add=False)
    crfPrice=models.FloatField()
    addCost=models.FloatField()
    costPriceInLiter=models.FloatField()
    density=models.FloatField()
    totalCost=models.FloatField()
    remarks=models.CharField(max_length=255,null=True,blank=True)
    approved=models.BooleanField(null=True,default=False)


    category = models.ForeignKey(
        AdditiveCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="additives"
    )

    name = models.ForeignKey(
        AdditiveCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="additives_name"
    )

    class Meta:
        verbose_name = _("Additive")
        verbose_name_plural = _("Additives")
        ordering = ['-id'] 

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("Additive_detail", kwargs={"pk": self.pk})

class AdditiveExtra(models.Model):
    additive = models.ForeignKey(
        "Additive", 
        on_delete=models.CASCADE,
        related_name="extras"  # ← add this
    )
    name = models.CharField(max_length=50)
    rate = models.FloatField(null=True, blank=True)


from django.db.models import Max
class ConsumptionFormula(models.Model):
    date=models.DateField(_("date"), auto_now=False, auto_now_add=False,null=True,blank=True)
    name=models.CharField(max_length=50)
    grade=models.CharField(max_length=50)
    sae=models.CharField(max_length=50)
    ref=models.CharField(max_length=50,unique=True, editable=False)
    remarks=models.CharField(max_length=255,null=True,blank=True)
    approved=models.BooleanField(null=True,default=False)


    class Meta:
        verbose_name = _("Consumption")
        verbose_name_plural = _("Consumptions")
        ordering = ['-id'] 

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("Consumption_detail", kwargs={"pk": self.pk})
    
    def save(self, *args, **kwargs):
        if not self.ref:
            last_ref = (
                ConsumptionFormula.objects
                .aggregate(max_ref=Max('ref'))['max_ref']
            )

            if last_ref:
                last_number = int(last_ref.split('-')[1])
                new_number = last_number + 1
            else:
                new_number = 1

            self.ref = f"BFR-{new_number:07d}"

        super().save(*args, **kwargs)

class ConsumptionFormulaAdditive(models.Model):
    consumption=models.ForeignKey(ConsumptionFormula,on_delete=models.CASCADE,null=True)
    name=models.CharField(max_length=50)
    qty_in_percent=models.FloatField()

    class Meta:
        verbose_name = _("ConsumptionFormulaAdditive")
        verbose_name_plural = _("ConsumptionFormulaAdditives")
        ordering = ['-id'] 

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
        ordering = ['-id'] 

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("ConsumptionFormulaBaseOil_detail", kwargs={"pk": self.pk})
    

class Consumption(models.Model):
    date=models.DateField(_("date"), auto_now=False, auto_now_add=False,null=True,blank=True)
    name=models.CharField(max_length=50)
    alias=models.CharField(max_length=50)
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
        ordering = ['-id'] 

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("Consumption_detail", kwargs={"pk": self.pk})

class ConsumptionAdditive(models.Model):
    consumption=models.ForeignKey(Consumption,on_delete=models.CASCADE,null=True)
    name=models.CharField(max_length=50)
    sub_name=models.CharField(max_length=50)
    qty_in_percent=models.FloatField()
    qty_in_litre=models.FloatField()
    value=models.FloatField()
    rate=models.FloatField()

    class Meta:
        verbose_name = _("ConsumptionAdditive")
        verbose_name_plural = _("ConsumptionAdditives")
        ordering = ['-id'] 

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("ConsumptionAdditive_detail", kwargs={"pk": self.pk})

class ConsumptionBaseOil(models.Model):
    consumption=models.ForeignKey(Consumption,on_delete=models.CASCADE,null=True)
    name=models.CharField(max_length=50)
    sub_name=models.CharField(max_length=50)
    qty_in_percent=models.FloatField()
    qty_in_litre=models.FloatField()
    value=models.FloatField()
    rate=models.FloatField()


    class Meta:
        verbose_name = _("ConsumptionBaseOil")
        verbose_name_plural = _("ConsumptionBaseOils")
        ordering = ['-id'] 

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("ConsumptionBaseOil_detail", kwargs={"pk": self.pk})

class FinalProduct(models.Model):
    date=models.DateField(_("date"), auto_now=False, auto_now_add=False)
    name=models.ForeignKey(Consumption,on_delete=models.CASCADE,null=True)
    packing_size=models.CharField(max_length=50,null=True,blank=True)
    bottles_per_pack=models.FloatField(null=True,blank=True)
    liters_per_pack=models.FloatField(null=True,blank=True)
    total_qty=models.FloatField(null=True,blank=True)
    total_qty_unit=models.CharField(max_length=50,null=True,blank=True)
    qty_in_liters=models.FloatField(null=True,blank=True)
    per_liter_cost=models.FloatField(null=True,blank=True)
    cost_per_case=models.FloatField(null=True,blank=True)
    # dk_cost=models.FloatField(null=True,blank=True)
    price_per_bottle=models.CharField(_("price_per_bottle"), max_length=50)
    price_per_label=models.CharField(_("price_per_label"), max_length=50)
    price_per_bottle_cap=models.CharField(_("price_per_bottle_cap"), max_length=50)
    bottle_per_case=models.FloatField(_("bottle_per_case"))
    label_per_case=models.FloatField(_("label_per_case"))
    bottle_cap_per_case=models.FloatField(_("bottle_cap_per_case"))
    price_per_carton=models.CharField(_("price_per_carton"), max_length=50)
    # dk_exprice=models.FloatField(null=True,blank=True)
    # ks_cost=models.FloatField(null=True,blank=True)
    # total_factory_price=models.FloatField(null=True,blank=True)
    # freight_logistic=models.FloatField(null=True,blank=True)
    total_cif_price=models.FloatField(null=True,blank=True)
    remarks=models.CharField(max_length=50,null=True,blank=True)
    approved=models.BooleanField(null=True,default=False)
    formula=models.CharField(max_length=5)

    class Meta:
        verbose_name = _("FinalProduct")
        verbose_name_plural = _("FinalProducts")
        ordering = ['-id'] 

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("FinalProduct_detail", kwargs={"pk": self.pk})
    
class FinalProductItem(models.Model):
    final_product=models.ForeignKey('FinalProduct',on_delete=models.CASCADE,related_name='final_product_items')
    label=models.CharField(max_length=100)
    value=models.FloatField()

    class Meta:
        ordering = ['-id'] 
   

class PackingType(models.Model):
    name=models.CharField(_("name"), max_length=50)
    
    class Meta:
        verbose_name = _("PackingType")
        verbose_name_plural = _("PackingTypes")
        ordering = ['-id'] 

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("PackingType_detail", kwargs={"pk": self.pk})
    

class ProductFormula(models.Model):
    formula_name=models.CharField(max_length=100)
    consumption_name=models.CharField(max_length=100)
    packing_type=models.CharField(max_length=100,blank=True,null=True)
    remarks=models.CharField(max_length=100,null=True,blank=True)

    class Meta:
        verbose_name = _("ProductFormula")
        verbose_name_plural = _("ProductFormulas")
        ordering = ['-id'] 

    def __str__(self):
        return self.formula_name
    
class ProductFormulaItem(models.Model):
    product_formula=models.ForeignKey('ProductFormula',on_delete=models.CASCADE,related_name='product_formula_items')
    label=models.CharField(max_length=100)
    value=models.FloatField()

    class Meta:
        ordering = ['-id'] 
   


class PackingSize(models.Model):
    name = models.CharField(max_length=255)
    bottles_per_pack=models.CharField(max_length=10)
    litres_per_pack = models.CharField(max_length=10)  # e.g., "KP", "SP", etc.

    class Meta:
        ordering = ['-id'] 
   
    def __str__(self):
        return self.name
    
    def get_absolute_url(self):
        return reverse("PackingSize_detail", kwargs={"pk": self.pk})