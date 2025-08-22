from django.db import models

class Ad(models.Model):
    PAGE_CHOICES = [
        ("all", "Todas"),
        ("simuladores", "Simuladores"),
        ("associacao", "Associação"),
        ("jogos", "Jogos"),
        ("dashboard", "Dashboard"),
        ("custom", "Customizada")
    ]
    title = models.CharField(max_length=100)
    image_url = models.URLField(blank=True)
    link = models.URLField(blank=True)
    page = models.CharField(max_length=32, choices=PAGE_CHOICES, default="all")
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
