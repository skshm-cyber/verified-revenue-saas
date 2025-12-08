from datetime import date, timedelta
from .models import Advertisement

def calculate_dynamic_price(slot_id, weeks, start_date_str=None):
    """
    Calculate price based on demand, duration, and urgency.
    Base Price: ₹5,000 / week
    """
    base_rate = 5000
    
    # 1. Demand Factor
    # Count how many future bookings this slot has
    future_bookings = Advertisement.objects.filter(
        slot_id=slot_id,
        end_date__gte=date.today()
    ).count()
    
    demand_multiplier = 1.0
    if future_bookings > 5:
        demand_multiplier = 1.5  # High demand: +50%
    elif future_bookings > 2:
        demand_multiplier = 1.2  # Medium demand: +20%
        
    # 2. Duration Discount
    duration_discount = 1.0
    if weeks >= 8:
        duration_discount = 0.80 # 20% off
    elif weeks >= 4:
        duration_discount = 0.90 # 10% off
        
    # 3. Urgency (Surge if booking last minute)
    urgency_multiplier = 1.0
    if start_date_str:
        try:
            start = date.fromisoformat(start_date_str)
            days_until = (start - date.today()).days
            if days_until <= 2 and future_bookings > 0:
                urgency_multiplier = 1.25 # Last minute premium
        except:
            pass
            
    # Calculate final weekly rate
    weekly_rate = base_rate * demand_multiplier * urgency_multiplier * duration_discount
    
    # Round to nearest 100
    weekly_rate = round(weekly_rate / 100) * 100
    
    total_price = weekly_rate * weeks
    
    return {
        "base_rate": base_rate,
        "final_weekly_rate": int(weekly_rate),
        "total_price": int(total_price),
        "applied_discounts": {
            "demand": f"{int((demand_multiplier-1)*100)}% surcharge" if demand_multiplier > 1 else None,
            "duration": f"{int((1-duration_discount)*100)}% off" if duration_discount < 1 else None
        }
    }
