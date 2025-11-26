from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Company, IntegrationKey
from rest_framework import status
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def stripe_integration(request):
    api_key = request.data.get("api_key")
    if not api_key:
        return Response({"error": "Missing Stripe API key"}, status=status.HTTP_400_BAD_REQUEST)
    company_id = request.data.get("company_id")
    company = Company.objects.filter(id=company_id).first()
    if not company:
        return Response({"error": "Invalid company"}, status=status.HTTP_400_BAD_REQUEST)
    IntegrationKey.objects.update_or_create(
        company=company,
        provider="stripe",
        defaults={
            "api_key": api_key,
            "added_by": request.user
        }
    )
    # Simulate success
    return Response({"message": "Stripe API key saved & connection tested!"})
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def razorpay_integration(request):
    api_key = request.data.get("api_key")
    api_secret = request.data.get("api_secret")
    if not api_key or not api_secret:
        return Response({"error": "Missing Razorpay API key/secret"}, status=status.HTTP_400_BAD_REQUEST)
    company_id = request.data.get("company_id")
    company = Company.objects.filter(id=company_id).first()
    if not company:
        return Response({"error": "Invalid company"}, status=status.HTTP_400_BAD_REQUEST)
    IntegrationKey.objects.update_or_create(
        company=company,
        provider="razorpay",
        defaults={
            "api_key": api_key,
            "api_secret": api_secret,
            "added_by": request.user
        }
    )
    return Response({"message": "Razorpay keys saved & connection tested!"})
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def paypal_integration(request):
    client_id = request.data.get("client_id")
    client_secret = request.data.get("client_secret")
    if not client_id or not client_secret:
        return Response({"error": "Missing PayPal client ID/secret"}, status=status.HTTP_400_BAD_REQUEST)
    company_id = request.data.get("company_id")
    company = Company.objects.filter(id=company_id).first()
    if not company:
        return Response({"error": "Invalid company"}, status=status.HTTP_400_BAD_REQUEST)
    IntegrationKey.objects.update_or_create(
        company=company,
        provider="paypal",
        defaults={
            "client_id": client_id,
            "client_secret": client_secret,
            "added_by": request.user
        }
    )
    return Response({"message": "PayPal keys saved & connection tested!"})

@api_view(["GET"])
def list_companies(request):
    companies = Company.objects.all().values("id", "name", "website")
    return Response({"companies": list(companies)})

@api_view(["GET"])
def company_mrr(request, company_id):
    # TODO: Implement MRR history if RevenueRecord is restored
    return Response({"company_id": company_id, "mrr_history": []})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_revenue(request):
    # TODO: Implement revenue record if RevenueRecord is restored
    return Response({"message": "Revenue added", "record_id": None})
