from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views  # ← correct import

urlpatterns = [
    path("health/", views.health_check, name="health_check"),
    # Auth
    path("signup/", views.signup, name="signup"),
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # User profile endpoint
    path('profile/', views.profile, name='user_profile'),
]
