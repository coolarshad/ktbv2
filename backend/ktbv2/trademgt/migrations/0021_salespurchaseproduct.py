# Generated by Django 5.0.7 on 2024-09-02 15:38

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trademgt', '0020_remove_trade_commission_trade_commission_agent'),
    ]

    operations = [
        migrations.CreateModel(
            name='SalesPurchaseProduct',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('product_name', models.CharField(max_length=50, verbose_name='product_name')),
                ('hs_code', models.CharField(max_length=50, verbose_name='hs_code')),
                ('tolerance', models.FloatField(verbose_name='tolerance')),
                ('batch_number', models.CharField(max_length=50, verbose_name='batch_number')),
                ('production_date', models.DateField(verbose_name='production_date')),
                ('trade_qty', models.FloatField(verbose_name='trade_qty')),
                ('trade_qty_unit', models.CharField(max_length=15, verbose_name='trade_qty_unit')),
                ('sp', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sp_product', to='trademgt.salespurchase')),
            ],
            options={
                'verbose_name': 'SalesPurchaseProduct',
                'verbose_name_plural': 'SalesPurchaseProducts',
            },
        ),
    ]