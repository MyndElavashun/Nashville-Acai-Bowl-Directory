# Netlify Functions for Stripe Integration

This directory contains Netlify serverless functions for handling Stripe payments in the Nashville Acai Bowl Directory.

## Setup Instructions

### 1. Environment Variables
Set the following environment variable in your Netlify dashboard:
- `STRIPE_SECRET_KEY`: Your Stripe secret key

### 2. Update Configuration
Before going live, update the following in `create-checkout-session.js`:
- Replace `STRIPE_PRICE_IDS` with your actual Stripe Price IDs
- Update `YOUR_DOMAIN` with your actual domain URL
- Update `success_url` and `cancel_url` paths as needed

## Function: create-checkout-session

**Endpoint**: `/.netlify/functions/create-checkout-session`
**Method**: POST
**Content-Type**: `application/json`

### Request Body
```json
{
  "type": "premium|family|vip",
  "email": "customer@example.com"
}
```

### Response
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### Frontend Integration Example
```javascript
async function createCheckoutSession(membershipType, customerEmail) {
  try {
    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: membershipType,
        email: customerEmail
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Usage example
createCheckoutSession('premium', 'user@example.com');
```

## Supported Membership Types
- `premium`: $5/month family membership
- `family`: $15/month (5 Premium memberships)
- `vip`: $49/year VIP Club membership