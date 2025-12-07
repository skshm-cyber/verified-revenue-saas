# API Integration Testing Guide

## Overview
The system now validates **real API keys** and fetches **actual revenue data** from payment providers.

## How It Works

### 1. **Stripe Integration**
- **Validates**: API key authenticity by calling Stripe's Balance API
- **Fetches**:
  - Last 30 days of charges
  - Active subscriptions for MRR calculation
  - Previous 30 days for growth calculation
- **Calculates**:
  - Monthly Revenue: MRR from subscriptions OR total charges
  - Growth: Percentage change vs previous period
- **Returns**: Verified revenue data or error if key is invalid

### 2. **Razorpay Integration**
- **Validates**: API Key + Secret by fetching payments
- **Fetches**:
  - Last 30 days of captured payments
  - Active subscriptions
  - Previous 30 days for growth
- **Calculates**:
  - Monthly Revenue: From subscriptions or total payments (converted from paise)
  - Growth: Percentage change vs previous period
- **Returns**: Verified revenue data or error if credentials are invalid

### 3. **PayPal Integration**
- **Validates**: Client ID + Secret by obtaining OAuth token
- **Fetches**:
  - Last 30 days of successful transactions
  - Previous 30 days for growth
- **Calculates**:
  - Monthly Revenue: Sum of successful transactions
  - Growth: Percentage change vs previous period
- **Returns**: Verified revenue data or error if credentials are invalid

## Testing Instructions

### Prerequisites
1. Backend server running: `python manage.py runserver`
2. Frontend running: `npm run dev`
3. User account created and logged in

### Test with Real API Keys

#### **Stripe Testing**
1. Get a **test API key** from Stripe Dashboard:
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy the "Secret key" (starts with `sk_test_`)
2. In the app:
   - Click "Add startup"
   - Select "Stripe" tab
   - Enter startup name
   - Paste your test API key
   - Click "Add startup"
3. **Expected Result**:
   - ✅ Success: Shows verified revenue from your Stripe test account
   - ❌ Error: "Invalid Stripe API key" if key is wrong

#### **Razorpay Testing**
1. Get **test credentials** from Razorpay Dashboard:
   - Go to https://dashboard.razorpay.com/app/keys
   - Copy "Key ID" and "Key Secret" (test mode)
2. In the app:
   - Click "Add startup"
   - Select "Razorpay" tab
   - Enter startup name
   - Paste Key ID and Secret
   - Click "Add startup"
3. **Expected Result**:
   - ✅ Success: Shows verified revenue from your Razorpay test account
   - ❌ Error: "Invalid Razorpay credentials" if wrong

#### **PayPal Testing**
1. Get **sandbox credentials** from PayPal Developer:
   - Go to https://developer.paypal.com/dashboard/applications/sandbox
   - Create or select an app
   - Copy "Client ID" and "Secret"
2. In the app:
   - Click "Add startup"
   - Select "PayPal" tab
   - Enter startup name
   - Paste Client ID and Secret
   - Click "Add startup"
3. **Expected Result**:
   - ✅ Success: Shows verified revenue from PayPal sandbox
   - ❌ Error: "Invalid PayPal credentials" if wrong

### Test with Invalid Keys
1. Try entering random/fake API keys
2. **Expected Result**: Should return error message, NOT add to leaderboard

## What Changed

### Before (❌ Old Behavior)
- Generated **random revenue numbers**
- No actual API validation
- Any key would be accepted
- Data was not real

### After (✅ New Behavior)
- **Validates API keys** by making real API calls
- **Fetches actual revenue** from payment provider
- **Rejects invalid keys** with error message
- **Calculates real growth** by comparing periods
- Only adds to leaderboard if validation succeeds

## Error Handling

The system now returns specific errors:
- `401 Unauthorized`: Invalid API credentials
- `400 Bad Request`: Missing required fields or API errors
- `500 Internal Server Error`: Unexpected errors

## Security Notes

⚠️ **Important**: 
- API keys are stored encrypted in the database
- Only read-only/restricted keys should be used
- Never share production API keys
- Use test/sandbox keys for development

## Revenue Calculation Details

### Stripe
- **MRR**: Sum of active subscription amounts
- **Fallback**: Total charges if no subscriptions
- **Growth**: (Current MRR - Previous MRR) / Previous MRR × 100

### Razorpay
- **MRR**: Sum of active subscription plans
- **Fallback**: Total captured payments
- **Amounts**: Converted from paise to rupees (÷ 100)
- **Growth**: Same formula as Stripe

### PayPal
- **Revenue**: Sum of successful transactions
- **Growth**: Comparison with previous 30-day period
- **Sandbox**: Uses sandbox API for testing

## Next Steps

To fully test:
1. Create test accounts on each platform
2. Generate test transactions/subscriptions
3. Add your test API keys via the app
4. Verify the revenue numbers match your dashboard
5. Check that invalid keys are rejected

## Production Deployment

Before going live:
1. Switch PayPal from sandbox to production API
2. Ensure all API keys are production keys
3. Set up proper error monitoring
4. Add rate limiting for API calls
5. Implement caching for revenue data
