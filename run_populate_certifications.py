#!/usr/bin/env python
"""
Script para popular dados iniciais de certificações
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.acredita_backend.settings')
django.setup()

from backend.certifications.populate_data import populate

if __name__ == '__main__':
    populate()
