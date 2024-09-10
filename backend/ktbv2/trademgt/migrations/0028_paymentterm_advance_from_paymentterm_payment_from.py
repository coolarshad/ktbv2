# Generated by Django 5.0.7 on 2024-09-10 21:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trademgt', '0027_remove_trade_cost_of_packing_per_each_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='paymentterm',
            name='advance_from',
            field=models.CharField(default='PERFORMA INVOICE', max_length=100, verbose_name='advance_from'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='paymentterm',
            name='payment_from',
            field=models.CharField(default='BL', max_length=100, verbose_name='payment_from'),
            preserve_default=False,
        ),
    ]
