from django.db import models
from django.contrib.auth.models import User

class Company(models.Model):
    CATEGORY_CHOICES = [
        ('saas', 'SaaS'),
        ('youtuber_gamer', 'YouTuber - Gamer'),
        ('youtuber_content_creator', 'YouTuber - Content Creator'),
        ('youtuber_educational', 'YouTuber - Educational'),
        ('influencer_instagram', 'Influencer - Instagram'),
        ('influencer_facebook', 'Influencer - Facebook'),
        ('influencer_twitter', 'Influencer - Twitter/X'),
        ('indian_startup', 'Indian Startup'),
        ('film_entertainment', 'Film/Entertainment'),
        ('business_india', 'Business in India'),
        ('ecommerce', 'E-commerce'),
        ('consulting', 'Consulting'),
        ('agency', 'Agency'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=255)
    website = models.URLField(blank=True, null=True)
    founder_name = models.CharField(max_length=255, blank=True, null=True)
    monthly_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    mom_growth = models.DecimalField(max_digits=5, decimal_places=2, default=0.00) # Percentage
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)
    logo_url = models.URLField(blank=True, null=True)  # Keep for backward compatibility
    founder_photo = models.ImageField(upload_to='founder_photos/', blank=True, null=True)  # Founder profile picture
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default='other')
    is_verified = models.BooleanField(default=False)  # Revenue verification status
    last_verified_at = models.DateTimeField(null=True, blank=True)  # Last verification timestamp
    show_in_leaderboard = models.BooleanField(default=True)  # Whether to show in public leaderboard
    is_anonymous = models.BooleanField(default=False)  # Hide company name/founder in leaderboard
    added_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)  # Owner
    description = models.TextField(blank=True, null=True, max_length=500)  # Company description
    twitter_handle = models.CharField(max_length=100, blank=True, null=True)  # Twitter/X handle
    
    # New fields for complete listing
    tagline = models.CharField(max_length=200, blank=True, null=True)  # Short tagline
    founding_date = models.DateField(null=True, blank=True)  # When the company was founded
    country = models.CharField(max_length=100, blank=True, null=True)  # Country code or name
    follower_count = models.IntegerField(default=0)  # Twitter/X follower count
    estimated_mrr = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)  # Estimated MRR

    def __str__(self):
        return self.name



class IntegrationKey(models.Model):
    PROVIDER_CHOICES = [
        ("stripe", "Stripe"),
        ("razorpay", "Razorpay"),
        ("paypal", "PayPal"),
    ]
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    api_key = models.CharField(max_length=255, blank=True, null=True)
    api_secret = models.CharField(max_length=255, blank=True, null=True)
    client_id = models.CharField(max_length=255, blank=True, null=True)
    client_secret = models.CharField(max_length=255, blank=True, null=True)
    added_by = models.ForeignKey(User, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company.name} - {self.provider}"


class Advertisement(models.Model):
    SLOT_CHOICES = [
        ('left_1', 'Left Sidebar 1'),
        ('left_2', 'Left Sidebar 2'),
        ('left_3', 'Left Sidebar 3'),
        ('left_4', 'Left Sidebar 4'),
        ('left_5', 'Left Sidebar 5'),
        ('right_1', 'Right Sidebar 1'),
        ('right_2', 'Right Sidebar 2'),
        ('right_3', 'Right Sidebar 3'),
        ('right_4', 'Right Sidebar 4'),
        ('right_5', 'Right Sidebar 5'),
    ]
    
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True) # Optional link to internal company
    
    # Ad Content
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=200)
    target_url = models.URLField(help_text="Where the ad links to")
    image = models.ImageField(upload_to='ad_images/', blank=True, null=True)
    
    # Scheduling & Status
    slot_id = models.CharField(max_length=20, choices=SLOT_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Payment Info
    payment_id = models.CharField(max_length=100, blank=True, null=True) # Transaction ID
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Analytics & Performance
    impressions = models.IntegerField(default=0)  # How many times ad was shown
    clicks = models.IntegerField(default=0)  # How many times ad was clicked
    
    # Notifications
    confirmation_email_sent = models.BooleanField(default=False)
    live_notification_sent = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Ad: {self.title} ({self.slot_id})"
    
    @property
    def ctr(self):
        """Click-through rate"""
        if self.impressions == 0:
            return 0
        return (self.clicks / self.impressions) * 100
    
    @property
    def is_live(self):
        """Check if ad is currently live"""
        from datetime import date
        today = date.today()
        return self.is_active and self.start_date <= today <= self.end_date
    
    @property
    def days_remaining(self):
        """Days until ad expires"""
        from datetime import date
        if not self.is_live:
            return 0
        return (self.end_date - date.today()).days
