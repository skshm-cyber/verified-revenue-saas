from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def home(request):
    return JsonResponse({"message": "Backend is running!"})

urlpatterns = [
    path("", home),  # 👈 fixes the 404 at "/"
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
    path("api/revenue/", include("revenue.urls")),


]
