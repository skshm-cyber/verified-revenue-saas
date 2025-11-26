from django.urls import path
from .views import list_companies, add_revenue, company_mrr, stripe_integration, razorpay_integration, paypal_integration

urlpatterns = [
    # List all companies
    path("companies/", list_companies, name="list_companies"),

    # Company MRR history (by company id)
    path("companies/<int:company_id>/mrr/", company_mrr, name="company_mrr"),

    # Add revenue record
    path("add/", add_revenue, name="add_revenue"),

    # Integration endpoints
    path("integrations/stripe/", stripe_integration, name="stripe_integration"),
    path("integrations/razorpay/", razorpay_integration, name="razorpay_integration"),
    path("integrations/paypal/", paypal_integration, name="paypal_integration"),
]
