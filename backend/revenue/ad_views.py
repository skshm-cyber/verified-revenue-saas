# Ad Management Views - My Ads Dashboard, Click Tracking, Analytics

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import models
from .models import Advertisement
from .serializers import AdvertisementSerializer
from datetime import datetime, date, timedelta

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_ads(request):
    """
    Get all ads for the logged-in user with analytics
    """
    ads = Advertisement.objects.filter(owner=request.user).order_by('-created_at')
    
    # Categorize ads
    active_ads = []
    scheduled_ads = []
    expired_ads = []
    
    today = date.today()
    
    for ad in ads:
        ad_data = AdvertisementSerializer(ad).data
        ad_data['is_live'] = ad.is_live
        ad_data['days_remaining'] = ad.days_remaining
        ad_data['ctr'] = round(ad.ctr, 2)
        
        if ad.is_live:
            active_ads.append(ad_data)
        elif ad.start_date > today:
            ad_data['starts_in_days'] = (ad.start_date - today).days
            scheduled_ads.append(ad_data)
        else:
            expired_ads.append(ad_data)
    
    return Response({
        'active': active_ads,
        'scheduled': scheduled_ads,
        'expired': expired_ads,
        'total_spent': sum(ad.amount_paid for ad in ads),
        'total_clicks': sum(ad.clicks for ad in ads),
        'total_impressions': sum(ad.impressions for ad in ads),
    })

@api_view(["POST"])
def track_ad_click(request, ad_id):
    """
    Track a click on an advertisement
    """
    try:
        ad = Advertisement.objects.get(id=ad_id)
        ad.clicks += 1
        ad.save(update_fields=['clicks'])
        return Response({'success': True, 'total_clicks': ad.clicks})
    except Advertisement.DoesNotExist:
        return Response({'error': 'Ad not found'}, status=404)

@api_view(["POST"])
def track_ad_impression(request):
    """
    Track impressions for visible ads
    Expects: {ad_ids: [1, 2, 3]}
    """
    ad_ids = request.data.get('ad_ids', [])
    Advertisement.objects.filter(id__in=ad_ids).update(impressions=models.F('impressions') + 1)
    return Response({'success': True, 'tracked': len(ad_ids)})

@api_view(["GET"])
def ad_availability_calendar(request):
    """
    Get availability calendar for next 90 days for all slots
    """
    from collections import defaultdict
    
    today = date.today()
    end_date = today + timedelta(days=90)
    
    # Get all bookings in the range
    bookings = Advertisement.objects.filter(
        is_active=True,
        end_date__gte=today,
        start_date__lte=end_date
    )
    
    # Build calendar
    calendar = {}
    all_slots = ['left_1', 'left_2', 'left_3', 'left_4', 'left_5',
                 'right_1', 'right_2', 'right_3', 'right_4', 'right_5']
    
    for slot in all_slots:
        slot_bookings = bookings.filter(slot_id=slot)
        booked_dates = []
        
        for booking in slot_bookings:
            current = booking.start_date
            while current <= booking.end_date:
                booked_dates.append(current.isoformat())
                current += timedelta(days=1)
        
        # Find next available date
        next_available = None
        check_date = today
        while check_date < end_date:
            if check_date.isoformat() not in booked_dates:
                next_available = check_date.isoformat()
                break
            check_date += timedelta(days=1)
        
        calendar[slot] = {
            'booked_dates': booked_dates,
            'next_available': next_available,
            'availability_percent': ((90 - len(set(booked_dates))) / 90) * 100
        }
    
    return Response(calendar)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def cancel_ad(request, ad_id):
    """
    Cancel/deactivate a scheduled ad (before it goes live)
    Refund if more than 7 days before start
    """
    try:
        ad = Advertisement.objects.get(id=ad_id, owner=request.user)
        
        if ad.start_date <= date.today():
            return Response({'error': 'Cannot cancel ad that has already started'}, status=400)
        
        days_until_start = (ad.start_date - date.today()).days
        
        ad.is_active = False
        ad.save()
        
        refund_eligible = days_until_start > 7
        
        return Response({
            'success': True,
            'message': 'Ad cancelled successfully',
            'refund_eligible': refund_eligible,
            'refund_amount': float(ad.amount_paid) if refund_eligible else 0
        })
    except Advertisement.DoesNotExist:
        return Response({'error': 'Ad not found'}, status=404)
