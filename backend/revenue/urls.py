from django.urls import path
from . import views, ad_views

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
    
    # Ad endpoints
    path("ads/slots/", views.get_ad_slots, name="get_ad_slots"),
    path("ads/book/", views.book_ad, name="book_ad"),
    path("ads/my/", ad_views.my_ads, name="my_ads"),
    path("ads/calendar/", ad_views.ad_availability_calendar, name="ad_calendar"),
    path("ads/<int:ad_id>/click/", ad_views.track_ad_click, name="track_ad_click"),
    path("ads/<int:ad_id>/cancel/", ad_views.cancel_ad, name="cancel_ad"),
    path("ads/impressions/", ad_views.track_ad_impression, name="track_ad_impression"),
]
