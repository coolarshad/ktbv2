# Generated by Django 5.0.7 on 2024-09-08 12:11

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('costmgt', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Consumption',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(blank=True, null=True, verbose_name='date')),
                ('name', models.CharField(max_length=50)),
                ('grade', models.CharField(max_length=50)),
                ('sae', models.CharField(max_length=50)),
                ('net_blending_qty', models.FloatField()),
                ('gross_vol_crosscheck', models.FloatField()),
                ('cross_check', models.FloatField()),
                ('total_value', models.FloatField(blank=True, null=True)),
                ('per_litre_cost', models.FloatField()),
                ('remarks', models.CharField(blank=True, max_length=255, null=True)),
                ('approved', models.BooleanField(default=False, null=True)),
            ],
            options={
                'verbose_name': 'Consumption',
                'verbose_name_plural': 'Consumptions',
            },
        ),
        migrations.CreateModel(
            name='ConsumptionAdditive',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('qty_in_percent', models.FloatField()),
                ('qty_in_litre', models.FloatField()),
                ('value', models.FloatField()),
                ('product', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='costmgt.consumption')),
            ],
            options={
                'verbose_name': 'ConsumptionAdditive',
                'verbose_name_plural': 'ConsumptionAdditives',
            },
        ),
        migrations.CreateModel(
            name='ConsumptionBaseOil',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('qty_in_percent', models.FloatField()),
                ('qty_in_litre', models.FloatField()),
                ('value', models.FloatField()),
                ('product', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='costmgt.consumption')),
            ],
            options={
                'verbose_name': 'ConsumptionBaseOil',
                'verbose_name_plural': 'ConsumptionBaseOils',
            },
        ),
    ]