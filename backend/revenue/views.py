from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Company, IntegrationKey
from rest_framework import status
import stripe
import razorpay
import requests
from datetime import datetime, timedelta
from decimal import Decimal

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def stripe_integration(request):
    """
    Validate Stripe API key and fetch real revenue data
    """
    api_key = request.data.get("api_key")
    company_name = request.data.get("company_name", "New Startup")
    
    if not api_key:
        return Response({"error": "Missing Stripe API key"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate Stripe API key and fetch revenue
    try:
        stripe.api_key = api_key
        
        # Test the API key by fetching balance
        balance = stripe.Balance.retrieve()
        
        # Fetch charges from the last 30 days to calculate MRR
        thirty_days_ago = int((datetime.now() - timedelta(days=30)).timestamp())
        charges = stripe.Charge.list(created={"gte": thirty_days_ago}, limit=100)
        
        # Calculate total revenue from charges
        total_revenue = sum(charge.amount for charge in charges.data if charge.paid) / 100  # Convert from cents
        
        # Fetch subscriptions for recurring revenue
        subscriptions = stripe.Subscription.list(status='active', limit=100)
        mrr = sum(sub.plan.amount for sub in subscriptions.data if hasattr(sub, 'plan')) / 100
        
        # Use MRR if available, otherwise use total revenue
        monthly_revenue = mrr if mrr > 0 else total_revenue
        
        # Calculate growth (simplified - compare with previous period)
        sixty_days_ago = int((datetime.now() - timedelta(days=60)).timestamp())
        prev_charges = stripe.Charge.list(created={"gte": sixty_days_ago, "lt": thirty_days_ago}, limit=100)
        prev_revenue = sum(charge.amount for charge in prev_charges.data if charge.paid) / 100
        
        if prev_revenue > 0:
            growth = ((monthly_revenue - prev_revenue) / prev_revenue) * 100
        else:
            growth = 0
        
    except stripe.error.AuthenticationError:
        return Response({"error": "Invalid Stripe API key"}, status=status.HTTP_401_UNAUTHORIZED)
    except stripe.error.StripeError as e:
        return Response({"error": f"Stripe API error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": f"Error validating Stripe key: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Create or update company
    company_id = request.data.get("company_id")
    category = request.data.get("category", "saas")
    show_in_leaderboard = request.data.get("show_in_leaderboard", True)
    is_anonymous = request.data.get("is_anonymous", False)
    description = request.data.get("description", "")
    website = request.data.get("website", "")
    twitter_handle = request.data.get("twitter_handle", "")
    
    if company_id:
        company = Company.objects.filter(id=company_id).first()
        if not company:
            return Response({"error": "Invalid company"}, status=status.HTTP_400_BAD_REQUEST)
    else:
        company = Company.objects.create(
            name=company_name,
            founder_name=request.user.username,
            category=category,
            show_in_leaderboard=show_in_leaderboard,
            is_anonymous=is_anonymous,
            added_by=request.user,
            description=description,
            website=website,
            twitter_handle=twitter_handle
        )
        
        # Handle logo upload
        if 'logo' in request.FILES:
            company.logo = request.FILES['logo']
            company.save()

    # Save integration key
    IntegrationKey.objects.update_or_create(
        company=company,
        provider="stripe",
        defaults={
            "api_key": api_key,
            "added_by": request.user
        }
    )
    
    # Update company with verified revenue
    company.monthly_revenue = Decimal(str(monthly_revenue))
    company.mom_growth = Decimal(str(round(growth, 2)))
    company.is_verified = True
    company.last_verified_at = datetime.now()
    company.save()

    return Response({
        "message": "Stripe API key validated & revenue verified!",
        "company_id": company.id,
        "revenue": monthly_revenue,
        "growth": round(growth, 2),
        "verified": True
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def razorpay_integration(request):
    """
    Validate Razorpay API credentials and fetch real revenue data
    """
    api_key = request.data.get("api_key")
    api_secret = request.data.get("api_secret")
    company_name = request.data.get("company_name", "New Startup")

    if not api_key or not api_secret:
        return Response({"error": "Missing Razorpay API key/secret"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate Razorpay credentials and fetch revenue
    try:
        client = razorpay.Client(auth=(api_key, api_secret))
        
        # Test the credentials by fetching payments
        # Calculate timestamp for last 30 days
        thirty_days_ago = int((datetime.now() - timedelta(days=30)).timestamp())
        
        payments = client.payment.all({
            'from': thirty_days_ago,
            'to': int(datetime.now().timestamp()),
            'count': 100
        })
        
        # Calculate total revenue (Razorpay amounts are in paise)
        total_revenue = sum(payment['amount'] for payment in payments['items'] if payment['status'] == 'captured') / 100
        
        # Fetch subscriptions for recurring revenue
        try:
            subscriptions = client.subscription.all({'count': 100})
            mrr = sum(sub['plan_id'] for sub in subscriptions['items'] if sub['status'] == 'active') / 100
        except:
            mrr = 0
        
        monthly_revenue = mrr if mrr > 0 else total_revenue
        
        # Calculate growth
        sixty_days_ago = int((datetime.now() - timedelta(days=60)).timestamp())
        prev_payments = client.payment.all({
            'from': sixty_days_ago,
            'to': thirty_days_ago,
            'count': 100
        })
        prev_revenue = sum(payment['amount'] for payment in prev_payments['items'] if payment['status'] == 'captured') / 100
        
        if prev_revenue > 0:
            growth = ((monthly_revenue - prev_revenue) / prev_revenue) * 100
        else:
            growth = 0
            
    except razorpay.errors.SignatureVerificationError:
        return Response({"error": "Invalid Razorpay credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": f"Error validating Razorpay credentials: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Create or update company
    company_id = request.data.get("company_id")
    category = request.data.get("category", "saas")
    show_in_leaderboard = request.data.get("show_in_leaderboard", True)
    is_anonymous = request.data.get("is_anonymous", False)
    description = request.data.get("description", "")
    website = request.data.get("website", "")
    twitter_handle = request.data.get("twitter_handle", "")
    
    if company_id:
        company = Company.objects.filter(id=company_id).first()
        if not company:
            return Response({"error": "Invalid company"}, status=status.HTTP_400_BAD_REQUEST)
    else:
        company = Company.objects.create(
            name=company_name,
            founder_name=request.user.username,
            category=category,
            show_in_leaderboard=show_in_leaderboard,
            is_anonymous=is_anonymous,
            added_by=request.user,
            description=description,
            website=website,
            twitter_handle=twitter_handle
        )
        
        # Handle logo upload
        if 'logo' in request.FILES:
            company.logo = request.FILES['logo']
            company.save()


    # Save integration key
    IntegrationKey.objects.update_or_create(
        company=company,
        provider="razorpay",
        defaults={
            "api_key": api_key,
            "api_secret": api_secret,
            "added_by": request.user
        }
    )

    # Update company with verified revenue
    company.monthly_revenue = Decimal(str(monthly_revenue))
    company.mom_growth = Decimal(str(round(growth, 2)))
    company.is_verified = True
    company.last_verified_at = datetime.now()
    company.save()

    return Response({
        "message": "Razorpay credentials validated & revenue verified!",
        "company_id": company.id,
        "revenue": monthly_revenue,
        "growth": round(growth, 2),
        "verified": True
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def paypal_integration(request):
    """
    Validate PayPal API credentials and fetch real revenue data
    """
    client_id = request.data.get("client_id")
    client_secret = request.data.get("client_secret")
    company_name = request.data.get("company_name", "New Startup")

    if not client_id or not client_secret:
        return Response({"error": "Missing PayPal client ID/secret"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate PayPal credentials and fetch revenue
    try:
        # Get access token
        auth_response = requests.post(
            'https://api-m.sandbox.paypal.com/v1/oauth2/token',  # Use sandbox for testing
            headers={'Accept': 'application/json', 'Accept-Language': 'en_US'},
            auth=(client_id, client_secret),
            data={'grant_type': 'client_credentials'}
        )
        
        if auth_response.status_code != 200:
            return Response({"error": "Invalid PayPal credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        
        access_token = auth_response.json()['access_token']
        
        # Fetch transactions from last 30 days
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        
        transactions_response = requests.get(
            'https://api-m.sandbox.paypal.com/v1/reporting/transactions',
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            },
            params={
                'start_date': start_date.strftime('%Y-%m-%dT%H:%M:%S-0700'),
                'end_date': end_date.strftime('%Y-%m-%dT%H:%M:%S-0700'),
                'fields': 'all',
                'page_size': 100
            }
        )
        
        if transactions_response.status_code == 200:
            transactions = transactions_response.json()
            total_revenue = sum(
                float(txn['transaction_info']['transaction_amount']['value'])
                for txn in transactions.get('transaction_details', [])
                if txn['transaction_info']['transaction_status'] == 'S'  # Success
            )
        else:
            total_revenue = 0
        
        monthly_revenue = total_revenue
        
        # Calculate growth (simplified)
        prev_start = start_date - timedelta(days=30)
        prev_transactions_response = requests.get(
            'https://api-m.sandbox.paypal.com/v1/reporting/transactions',
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            },
            params={
                'start_date': prev_start.strftime('%Y-%m-%dT%H:%M:%S-0700'),
                'end_date': start_date.strftime('%Y-%m-%dT%H:%M:%S-0700'),
                'fields': 'all',
                'page_size': 100
            }
        )
        
        if prev_transactions_response.status_code == 200:
            prev_transactions = prev_transactions_response.json()
            prev_revenue = sum(
                float(txn['transaction_info']['transaction_amount']['value'])
                for txn in prev_transactions.get('transaction_details', [])
                if txn['transaction_info']['transaction_status'] == 'S'
            )
            
            if prev_revenue > 0:
                growth = ((monthly_revenue - prev_revenue) / prev_revenue) * 100
            else:
                growth = 0
        else:
            growth = 0
            
    except requests.exceptions.RequestException as e:
        return Response({"error": f"PayPal API error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": f"Error validating PayPal credentials: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Create or update company
    company_id = request.data.get("company_id")
    category = request.data.get("category", "saas")
    show_in_leaderboard = request.data.get("show_in_leaderboard", True)
    is_anonymous = request.data.get("is_anonymous", False)
    description = request.data.get("description", "")
    website = request.data.get("website", "")
    twitter_handle = request.data.get("twitter_handle", "")
    
    if company_id:
        company = Company.objects.filter(id=company_id).first()
        if not company:
            return Response({"error": "Invalid company"}, status=status.HTTP_400_BAD_REQUEST)
    else:
        company = Company.objects.create(
            name=company_name,
            founder_name=request.user.username,
            category=category,
            show_in_leaderboard=show_in_leaderboard,
            is_anonymous=is_anonymous,
            added_by=request.user,
            description=description,
            website=website,
            twitter_handle=twitter_handle
        )
        
        # Handle logo upload
        if 'logo' in request.FILES:
            company.logo = request.FILES['logo']
            company.save()

    # Save integration key
    IntegrationKey.objects.update_or_create(
        company=company,
        provider="paypal",
        defaults={
            "client_id": client_id,
            "client_secret": client_secret,
            "added_by": request.user
        }
    )

    # Update company with verified revenue
    company.monthly_revenue = Decimal(str(monthly_revenue))
    company.mom_growth = Decimal(str(round(growth, 2)))
    company.is_verified = True
    company.last_verified_at = datetime.now()
    company.save()

    return Response({
        "message": "PayPal credentials validated & revenue verified!",
        "company_id": company.id,
        "revenue": monthly_revenue,
        "growth": round(growth, 2),
        "verified": True
    })

from .serializers import CompanySerializer

@api_view(["GET"])
def list_companies(request):
    """
    List companies with optional category filtering.
    Only shows companies that opted into the leaderboard.
    """
    # Get category filter from query params
    category = request.query_params.get('category', None)
    
    # Base queryset - only companies that want to be shown
    companies = Company.objects.filter(show_in_leaderboard=True)
    
    # Apply category filter if provided
    if category and category != 'all':
        companies = companies.filter(category=category)
    
    # Order by revenue descending
    companies = companies.order_by("-monthly_revenue")
    
    serializer = CompanySerializer(companies, many=True)
    return Response(serializer.data)

@api_view(["GET"])
def get_company_details(request, company_id):
    """
    Get details for a single company.
    Visible if show_in_leaderboard is True OR if request.user is the owner.
    """
    try:
        company = Company.objects.get(id=company_id)
        
        # Check visibility
        is_owner = False
        if request.user.is_authenticated:
            if company.added_by == request.user:
                is_owner = True
            elif company.added_by is None and company.founder_name == request.user.username:
                is_owner = True
        
        if not company.show_in_leaderboard and not is_owner:
            return Response({"error": "Company not found or private"}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = CompanySerializer(company)
        return Response(serializer.data)
        
    except Company.DoesNotExist:
        return Response({"error": "Company not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(["GET"])
def company_mrr(request, company_id):
    # TODO: Implement MRR history if RevenueRecord is restored
    return Response({"company_id": company_id, "mrr_history": []})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_revenue(request):
    # TODO: Implement revenue record if RevenueRecord is restored
    return Response({"message": "Revenue added", "record_id": None})

@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_company(request, company_id):
    """
    Update company details. Only owner can update.
    """
    try:
        company = Company.objects.get(id=company_id)
        # Check ownership: either added_by matches OR (added_by is None AND founder_name matches)
        if company.added_by != request.user:
            if company.added_by is None and company.founder_name == request.user.username:
                # Legacy fallback: claim ownership
                company.added_by = request.user
                company.save()
            else:
                return Response({"error": "Company not found or unauthorized"}, status=status.HTTP_404_NOT_FOUND)
    except Company.DoesNotExist:
        return Response({"error": "Company not found or unauthorized"}, status=status.HTTP_404_NOT_FOUND)
    
    # Update fields
    if 'name' in request.data:
        company.name = request.data['name']
    if 'description' in request.data:
        company.description = request.data['description']
    if 'website' in request.data:
        company.website = request.data['website']
    if 'twitter_handle' in request.data:
        company.twitter_handle = request.data['twitter_handle']
    if 'category' in request.data:
        company.category = request.data['category']
    if 'founder_name' in request.data:
        company.founder_name = request.data['founder_name']
    
    # Handle logo upload
    if 'logo' in request.FILES:
        company.logo = request.FILES['logo']
    
    # Handle founder photo upload
    if 'founder_photo' in request.FILES:
        company.founder_photo = request.FILES['founder_photo']
    
    company.save()
    serializer = CompanySerializer(company)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def refresh_api_key(request, company_id):
    """
    Refresh API key and re-verify revenue.
    """
    try:
        company = Company.objects.get(id=company_id)
        if company.added_by != request.user:
            if company.added_by is None and company.founder_name == request.user.username:
                company.added_by = request.user
                company.save()
            else:
                return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
    except Company.DoesNotExist:
        return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
    
    # Get integration key
    integration = IntegrationKey.objects.filter(company=company).first()
    if not integration:
        return Response({"error": "No integration found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Get new API key from request
    new_api_key = request.data.get('api_key')
    if not new_api_key:
        return Response({"error": "API key required"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Update the integration key
    integration.api_key = new_api_key
    if 'api_secret' in request.data:
        integration.api_secret = request.data['api_secret']
    if 'client_id' in request.data:
        integration.client_id = request.data['client_id']
    if 'client_secret' in request.data:
        integration.client_secret = request.data['client_secret']
    integration.save()
    
    # Re-verify revenue based on provider
    try:
        if integration.provider == 'stripe':
            stripe.api_key = new_api_key
            thirty_days_ago = int((datetime.now() - timedelta(days=30)).timestamp())
            charges = stripe.Charge.list(created={"gte": thirty_days_ago}, limit=100)
            total_revenue = sum(charge.amount for charge in charges.data if charge.paid) / 100
            subscriptions = stripe.Subscription.list(status='active', limit=100)
            mrr = sum(sub.plan.amount for sub in subscriptions.data if hasattr(sub, 'plan')) / 100
            monthly_revenue = mrr if mrr > 0 else total_revenue
            
        elif integration.provider == 'razorpay':
            client = razorpay.Client(auth=(new_api_key, integration.api_secret))
            thirty_days_ago = int((datetime.now() - timedelta(days=30)).timestamp())
            payments = client.payment.all({'from': thirty_days_ago, 'to': int(datetime.now().timestamp()), 'count': 100})
            monthly_revenue = sum(payment['amount'] for payment in payments['items'] if payment['status'] == 'captured') / 100
            
        elif integration.provider == 'paypal':
            # PayPal refresh logic
            auth_response = requests.post(
                'https://api-m.sandbox.paypal.com/v1/oauth2/token',
                headers={'Accept': 'application/json'},
                auth=(integration.client_id, integration.client_secret),
                data={'grant_type': 'client_credentials'}
            )
            if auth_response.status_code == 200:
                access_token = auth_response.json()['access_token']
                end_date = datetime.now()
                start_date = end_date - timedelta(days=30)
                transactions_response = requests.get(
                    'https://api-m.sandbox.paypal.com/v1/reporting/transactions',
                    headers={'Authorization': f'Bearer {access_token}'},
                    params={
                        'start_date': start_date.strftime('%Y-%m-%dT%H:%M:%S-0700'),
                        'end_date': end_date.strftime('%Y-%m-%dT%H:%M:%S-0700'),
                        'page_size': 100
                    }
                )
                if transactions_response.status_code == 200:
                    transactions = transactions_response.json()
                    monthly_revenue = sum(
                        float(txn['transaction_info']['transaction_amount']['value'])
                        for txn in transactions.get('transaction_details', [])
                        if txn['transaction_info']['transaction_status'] == 'S'
                    )
                else:
                    monthly_revenue = 0
            else:
                return Response({"error": "Invalid PayPal credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({"error": "Unknown provider"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update company revenue
        company.monthly_revenue = Decimal(str(monthly_revenue))
        company.last_verified_at = datetime.now()
        company.save()
        
        return Response({
            "message": "Revenue refreshed successfully",
            "revenue": monthly_revenue,
            "last_verified_at": company.last_verified_at
        })
        
    except Exception as e:
        return Response({"error": f"Failed to refresh revenue: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_company(request, company_id):
    """
    Delete company. Only owner can delete.
    """
    try:
        company = Company.objects.get(id=company_id)
        if company.added_by != request.user:
            if company.added_by is None and company.founder_name == request.user.username:
                company.added_by = request.user
                company.save()
            else:
                return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
    except Company.DoesNotExist:
        return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
    
    company.delete()
    return Response({"message": "Company deleted successfully"}, status=status.HTTP_200_OK)


# -------------------------------------------------------------------------
# ADVERTISEMENT SYSTEM
# -------------------------------------------------------------------------
from .models import Advertisement
from .serializers import AdvertisementSerializer

@api_view(["GET"])
def get_ad_slots(request):
    """
    Get status of all ad slots for a specific date (default: today).
    """
    date_str = request.query_params.get('date')
    if date_str:
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({"error": "Invalid date format YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)
    else:
        target_date = datetime.now().date()
        
    slots = [
        'left_1', 'left_2', 'left_3', 'left_4', 'left_5',
        'right_1', 'right_2', 'right_3', 'right_4', 'right_5'
    ]
    
    result = {}
    
    for slot in slots:
        # Find active ad for this slot and date
        active_ad = Advertisement.objects.filter(
            slot_id=slot,
            start_date__lte=target_date,
            end_date__gte=target_date,
            is_active=True
        ).first()
        
        if active_ad:
            result[slot] = {
                "status": "booked",
                "ad": AdvertisementSerializer(active_ad).data
            }
        else:
            # Check availability for advance booking (optional enhancement)
            result[slot] = {
                "status": "available",
                "price": 5000 # Example price INR
            }
            
    return Response(result)

@api_view(["POST"])
def get_price_estimate(request):
    """
    Get dynamic price estimate based on slot, duration and date
    """
    slot_id = request.data.get('slot_id')
    weeks = int(request.data.get('duration', 1))
    start_date = request.data.get('start_date')
    
    from .pricing import calculate_dynamic_price
    price_info = calculate_dynamic_price(slot_id, weeks, start_date)
    
    return Response(price_info)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def book_ad(request):

    """
    Book an ad slot.
    """
    print("=== AD BOOKING DEBUG ===")
    print("request.data:", request.data)
    print("request.FILES:", request.FILES)
    
    slot_id = request.data.get('slot_id')
    start_date_str = request.data.get('start_date')
    end_date_str = request.data.get('end_date')
    
    print(f"slot_id: {slot_id}, start_date: {start_date_str}, end_date: {end_date_str}")
    
    if not all([slot_id, start_date_str, end_date_str]):
        error_msg = f"Missing fields - slot_id: {slot_id}, start_date: {start_date_str}, end_date: {end_date_str}"
        print("ERROR:", error_msg)
        return Response({"error": error_msg}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
    except ValueError as e:
        print("Date parsing error:", e)
        return Response({"error": f"Invalid date format: {e}"}, status=status.HTTP_400_BAD_REQUEST)
        
    if start_date < datetime.now().date() or end_date < start_date:
        return Response({"error": "Invalid date range"}, status=status.HTTP_400_BAD_REQUEST)
        
    # Check overlapping
    overlap = Advertisement.objects.filter(
        slot_id=slot_id,
        is_active=True,
        start_date__lte=end_date,
        end_date__gte=start_date
    ).exists()
    
    if overlap:
        return Response({"error": "Slot already booked for these dates"}, status=status.HTTP_409_CONFLICT)
        
    # Create Ad
    payment_id = request.data.get('payment_id')
    amount_paid = request.data.get('amount_paid', 0)
    
    # Build ad data manually
    ad_data = {
        'title': request.data.get('title'),
        'description': request.data.get('description', ''),
        'target_url': request.data.get('target_url'),
        'slot_id': slot_id,
        'start_date': start_date,
        'end_date': end_date,
        'is_active': True,
    }
    
    print("ad_data to create:", ad_data)
    
    # Create advertisement directly
    try:
        ad = Advertisement.objects.create(
            owner=request.user,
            title=ad_data['title'],
            description=ad_data['description'],
            target_url=ad_data['target_url'],
            slot_id=ad_data['slot_id'],
            start_date=ad_data['start_date'],
            end_date=ad_data['end_date'],
            payment_id=payment_id,
            amount_paid=amount_paid,
            is_active=True
        )
        
        # Handle image if present
        if 'image' in request.FILES:
            ad.image = request.FILES['image']
            ad.save()
        
        # Send confirmation email
        try:
            from .notifications import send_ad_confirmation_email
            send_ad_confirmation_email(ad)
            ad.confirmation_email_sent = True
            ad.save(update_fields=['confirmation_email_sent'])
        except Exception as email_error:
            print(f"Email notification failed: {email_error}")
            # Don't fail the booking if email fails
        
        print("Ad created successfully:", ad.id)
        serializer = AdvertisementSerializer(ad)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        print("Ad creation error:", e)
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

