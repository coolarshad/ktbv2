# Generated by Django 5.0.7 on 2024-08-06 18:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('trademgt', '0009_rename_related_trades_trade_related_trade'),
    ]

    operations = [
        migrations.RenameField(
            model_name='trade',
            old_name='related_trade',
            new_name='related_trades',
        ),
    ]
