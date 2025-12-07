from rest_framework import serializers
from .models import Company

class CompanySerializer(serializers.ModelSerializer):
    added_by_username = serializers.CharField(source='added_by.username', read_only=True)
    
    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "website",
            "founder_name",
            "monthly_revenue",
            "mom_growth",
            "logo",
            "logo_url",
            "founder_photo",
            "category",
            "is_verified",
            "last_verified_at",
            "show_in_leaderboard",
            "is_anonymous",
            "added_by",
            "added_by_username",
            "description",
            "twitter_handle",
            "tagline",
            "founding_date",
            "country",
            "follower_count",
            "estimated_mrr"
        ]
        read_only_fields = ['added_by', 'added_by_username']
