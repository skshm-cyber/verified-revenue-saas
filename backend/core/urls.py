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

# Serve media files in development
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
