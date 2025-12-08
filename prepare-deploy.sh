#!/bin/bash

echo "🚀 Preparing for deployment..."

# Generate secret key
echo ""
echo "📝 Generate a SECRET_KEY for Railway:"
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

echo ""
echo "✅ Deployment files ready!"
echo ""
echo "Next steps:"
echo "1. Push code to GitHub"
echo "2. Deploy backend to Railway.app"
echo "3. Deploy frontend to Vercel.com"
echo ""
echo "📖 Full instructions: See DEPLOYMENT_GUIDE.md"
