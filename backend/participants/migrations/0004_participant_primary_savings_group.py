"""
Migration: Add primary_savings_group to Participant model
"""
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('kixikila', '0001_initial'),  # Adjust based on your latest kixikila migration
        ('participants', '0001_initial'),  # Adjust based on your latest participants migration
    ]

    operations = [
        migrations.AddField(
            model_name='participant',
            name='primary_savings_group',
            field=models.ForeignKey(
                blank=True,
                help_text='Grupo Kixikila principal para financiamento sustentável',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='primary_members',
                to='kixikila.kixikilagroup',
                verbose_name='Grupo de Poupança Principal'
            ),
        ),
    ]
