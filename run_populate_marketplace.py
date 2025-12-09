#!/usr/bin/env python
"""
Executar script de população de categorias do marketplace.
"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.acredita_backend.settings")
django.setup()

from backend.marketplace.populate_categories import populate

if __name__ == "__main__":
    print("🔄 Populando categorias do marketplace...")
    populate()
    print("\n✅ Concluído!")
