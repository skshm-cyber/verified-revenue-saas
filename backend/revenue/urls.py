from django.urls import path
from . import views

urlpatterns = [
    path("companies/", views.list_companies, name="list_companies"),
    path("companies/<int:company_id>/", views.get_company_details, name="get_company_details"),
    path("companies/<int:company_id>/mrr/", views.company_mrr, name="company_mrr"),
    path("companies/<int:company_id>/update/", views.update_company, name="update_company"),
    path("companies/<int:company_id>/refresh/", views.refresh_api_key, name="refresh_api_key"),
    path("companies/<int:company_id>/delete/", views.delete_company, name="delete_company"),
    path("revenue/add/", views.add_revenue, name="add_revenue"),
    
    # Integration endpoints
    path("integrations/stripe/", views.stripe_integration, name="stripe_integration"),
    path("integrations/razorpay/", views.razorpay_integration, name="razorpay_integration"),
    path("integrations/paypal/", views.paypal_integration, name="paypal_integration"),
]
