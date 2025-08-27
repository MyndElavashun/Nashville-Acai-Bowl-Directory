// Netlify serverless function for creating Stripe Checkout sessions
// Handles POST requests from frontend with {type, email} and returns Stripe Checkout sessionId
// 
// REQUIRED ENVIRONMENT VARIABLE:
// - STRIPE_SECRET_KEY: Your Stripe secret key (set in Netlify dashboard)
//
// BEFORE GOING LIVE:
// 1. Update STRIPE_PRICE_IDS with your actual Stripe Price IDs
// 2. Update success_url and cancel_url to your actual domain URLs
// 3. Set STRIPE_SECRET_KEY environment variable in Netlify settings

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// TODO: Replace these with your actual Stripe Price IDs before going live
const STRIPE_PRICE_IDS = {
  premium: 'price_REPLACE_WITH_PREMIUM_PRICE_ID',
  family: 'price_REPLACE_WITH_FAMILY_PRICE_ID', 
  vip: 'price_REPLACE_WITH_VIP_PRICE_ID'
};

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Parse request body
    const { type, email } = JSON.parse(event.body);

    // Validate required fields
    if (!type || !email) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Missing required fields: type and email are required' 
        })
      };
    }

    // Validate membership type
    if (!STRIPE_PRICE_IDS[type]) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Invalid membership type. Valid types: premium, family, vip' 
        })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Invalid email format' 
        })
      };
    }

    // TODO: Update these URLs to your actual domain before going live
    const YOUR_DOMAIN = 'https://your-site.netlify.app'; // Replace with your actual domain
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRICE_IDS[type],
          quantity: 1,
        },
      ],
      mode: 'subscription', // Use 'subscription' for recurring payments
      success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
      metadata: {
        membership_type: type,
        customer_email: email
      }
    });

    // Return the session ID
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      })
    };

  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Internal server error while creating checkout session' 
      })
    };
  }
};