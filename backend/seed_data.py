import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from revenue.models import Company

companies_data = [
    {
        "name": "Gumroad",
        "founder_name": "@sh1",
        "monthly_revenue": 878595.86,
        "mom_growth": 0.0,
        "category": "E-commerce",
        "website": "https://gumroad.com"
    },
    {
        "name": "easytools",
        "founder_name": "@greg_rog",
        "monthly_revenue": 82107.08,
        "mom_growth": 0.0,
        "category": "SaaS",
        "website": "https://easy.tools"
    },
    {
        "name": "MaidsnBlack",
        "founder_name": "@rohangilkes",
        "monthly_revenue": 21772.98,
        "mom_growth": 8.0,
        "category": "Marketplace",
        "website": "https://maidsinblack.com"
    },
    {
        "name": "Stack Influence",
        "founder_name": "@laurent_vinc",
        "monthly_revenue": 19779.97,
        "mom_growth": 2.0,
        "category": "Marketing",
        "website": "https://stackinfluence.com"
    },
    {
        "name": "TrimRx",
        "founder_name": "@hawktrin",
        "monthly_revenue": 10277.11,
        "mom_growth": 22.0,
        "category": "Health",
        "website": "https://trimrx.com"
    },
    {
        "name": "Arcads AI",
        "founder_name": "@rom1trs",
        "monthly_revenue": 9565.03,
        "mom_growth": 29.0,
        "category": "AI",
        "website": "https://arcads.ai"
    },
    {
        "name": "HypeProxies",
        "founder_name": "@basedgunnar",
        "monthly_revenue": 9016.41,
        "mom_growth": -1.0,
        "category": "Infrastructure",
        "website": "https://hypeproxies.io"
    }
]

for data in companies_data:
    company, created = Company.objects.get_or_create(name=data['name'])
    company.founder_name = data['founder_name']
    company.monthly_revenue = data['monthly_revenue']
    company.mom_growth = data['mom_growth']
    company.category = data['category']
    company.website = data['website']
    company.save()
    print(f"{'Created' if created else 'Updated'} {company.name}")
