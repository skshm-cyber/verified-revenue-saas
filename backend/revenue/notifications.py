# Email Notification Tasks
# This would typically use Celery for async, but for simplicity we'll use direct email

ADMIN_EMAIL = 'admin@trustmrr.com'
NOTIFICATION_FROM_EMAIL = 'noreply@trustmrr.com'

def send_ad_confirmation_email(ad):
    """Send confirmation email when ad is booked"""
    from django.core.mail import send_mail
    from django.template.loader import render_to_string
    
    subject = f'✅ Your Ad on TrustMRR is Confirmed! (Slot: {ad.slot_id})'
    
    message = f"""
    Hi {ad.owner.username},
    
    Great news! Your advertisement has been successfully booked on TrustMRR.
    
    📊 Booking Details:
    • Ad Title: {ad.title}
    • Slot Position: {ad.slot_id}
    • Start Date: {ad.start_date.strftime('%B %d, %Y')}
    • End Date: {ad.end_date.strftime('%B %d, %Y')}
    • Amount Paid: ₹{ad.amount_paid:,}
    • Payment ID: {ad.payment_id}
    
    📅 Your ad will go LIVE on {ad.start_date.strftime('%B %d, %Y')} at 12:00 AM IST
    
    🎯 What happens next:
    1. Your ad is now in our system
    2. It will automatically appear on the leaderboard starting {ad.start_date.strftime('%b %d')}
    3. You'll receive a notification when it goes live
    4. You'll get analytics reports weekly
    5. We'll remind you 2 days before expiry
    
    📈 Track Your Performance:
    Visit your dashboard to see real-time clicks and impressions.
    
    Questions? Reply to this email or contact support@trustmrr.com
    
    Best regards,
    TrustMRR Team
    """
    
    send_mail(
        subject,
        message,
        NOTIFICATION_FROM_EMAIL,
        [ad.owner.email],
        fail_silently=True,
    )

def send_ad_live_notification(ad):
    """Send email when ad goes live"""
    from django.core.mail import send_mail
    
    subject = f'🚀 Your Ad is Now LIVE on TrustMRR!'
    
    message = f"""
    Hi {ad.owner.username},
    
    Your advertisement "{ad.title}" is now LIVE and visible to all TrustMRR visitors!
    
    📊 Live Stats (Real-time):
    • Slot: {ad.slot_id}
    • Duration: {ad.end_date - ad.start_date} days remaining
    • Target: {ad.target_url}
    
    📈 Track your performance:
    Log in to see live click-through rates and impressions.
    
    Want to extend your ad? Book additional weeks at any time.
    
    Best regards,
    TrustMRR Team
    """
    
    send_mail(
        subject,
        message,
        NOTIFICATION_FROM_EMAIL,
        [ad.owner.email],
        fail_silently=False,
    )

def send_expiry_reminder(ad, days_remaining):
    """Send reminder before ad expires"""
    from django.core.mail import send_mail
    
    subject = f'⏰ Your TrustMRR Ad Expires in {days_remaining} Days'
    
    message  = f"""
    Hi {ad.owner.username},
    
    Your advertisement "{ad.title}" will expire soon.
    
    ⏳ Time Remaining: {days_remaining} days
    📅 Expiry Date: {ad.end_date.strftime('%B %d, %Y')}
    
    Want to keep your ad running?
    Extend now and get 10% off on renewals!
    
    [Extend My Ad] → Log in to your dashboard
    
    Best regards,
    TrustMRR Team
    """
    
    send_mail(
        subject,
        message,
        NOTIFICATION_FROM_EMAIL,
        [ad.owner.email],
        fail_silently=True,
    )
