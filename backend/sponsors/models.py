from django.db import models
from django.utils import timezone


class Sponsor(models.Model):
    """
    Modelo para representar patrocinadores e parceiros do programa Acredita.
    """
    SPONSOR_TYPE_CHOICES = [
        ('sponsor', 'Patrocinador'),
        ('partner', 'Parceiro'),
        ('supporter', 'Apoiador'),
    ]

    name = models.CharField(
        max_length=255,
        unique=True,
        help_text="Nome do patrocinador/parceiro"
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Descrição do patrocinador/parceiro"
    )
    logo = models.URLField(
        help_text="URL do logo do patrocinador/parceiro"
    )
    url = models.URLField(
        blank=True,
        null=True,
        help_text="Website ou link do patrocinador"
    )
    sponsor_type = models.CharField(
        max_length=20,
        choices=SPONSOR_TYPE_CHOICES,
        default='partner',
        help_text="Tipo de patrocínio"
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text="Ordem de exibição (ascendente)"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Se o patrocinador deve ser exibido"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Data de criação"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Data de última atualização"
    )

    class Meta:
        ordering = ['order', 'name']
        verbose_name = 'Patrocinador'
        verbose_name_plural = 'Patrocinadores'

    def __str__(self):
        return f"{self.name} ({self.get_sponsor_type_display()})"
