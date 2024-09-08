from django.db import models
from django.utils.translation import gettext_lazy as _
# Create your models here.

class Packing(models.Model):
    date=models.DateField(_("date"), auto_now=False, auto_now_add=False)
    name=models.CharField(max_length=50)
    per_each=models.FloatField()
    category=models.CharField(max_length=50,blank=True,null=True)
    remarks=models.CharField(max_length=255,null=True,blank=True)
    approved=models.BooleanField(null=True,default=False)
    
    class Meta:
        verbose_name = _("Packing")
        verbose_name_plural = _("Packings")
        
    def __str__(self):
        return self.name
    
    def get_absolute_url(self):
        return reverse("Packing_detail", kwargs={"pk": self.pk})

class RawMaterial(models.Model):
    name=models.CharField(max_length=50)
    cost_per_liter=models.FloatField()
    buy_price_pmt=models.FloatField()
    add_cost=models.FloatField()
    total=models.FloatField()
    ml_to_kl=models.FloatField()
    density=models.FloatField()
    remarks=models.CharField(max_length=255,null=True,blank=True)
    approved=models.BooleanField(null=True,default=False)
    
    class Meta:
        verbose_name = _("RawMaterial")
        verbose_name_plural = _("RawMaterials")
        
    def __str__(self):
        return self.name
    
    def get_absolute_url(self):
        return reverse("RawMaterial_detail", kwargs={"pk": self.pk})


class Additive(models.Model):
    name=models.CharField(max_length=50)
    date=models.DateField(_("date"), auto_now=False, auto_now_add=False)
    per_each=models.FloatField()
    category=models.CharField(max_length=50,blank=True,null=True)
    remarks=models.CharField(max_length=255,null=True,blank=True)
    approved=models.BooleanField(null=True,default=False)

    class Meta:
        verbose_name = _("Additive")
        verbose_name_plural = _("Additives")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("Additive_detail", kwargs={"pk": self.pk})


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
