# Generated by Django 5.0.7 on 2024-09-04 20:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trademgt', '0023_remove_paymentfinance_batch_number_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='paymentfinance',
            name='balance_paymnet_made',
        ),
        migrations.AddField(
            model_name='paymentfinance',
            name='balance_payment_made',
            field=models.FloatField(null=True, verbose_name='balance_payment_made'),
        ),
    ]
