# Switching from Simulated to Real Stripe

Currently, the app uses a **simulated Stripe checkout** for testing. When you're ready to go live with real payments, follow these steps:

## 1. Set Up Stripe Account

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Create Products and Price IDs for each tier

## 2. Configure Environment Variables

Add your Stripe keys to `.env.local`:

```env
# Required for production
NEXT_PUBLIC_APP_URL=https://www.aurix.pics
STRIPE_SECRET_KEY=sk_live_your_actual_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Create these Price IDs in Stripe Dashboard
STRIPE_STARTER_PRICE_ID=price_actual_id_here
STRIPE_PRO_100_PRICE_ID=price_actual_id_here
STRIPE_PRO_200_PRICE_ID=price_actual_id_here
# ... etc for all tiers
```

## 3. Update PaywallGate Component

In `components/PaywallGate.tsx`, change line ~71:

### Current (Simulated):
```typescript
const response = await fetch('/api/checkout/simulate', {
```

### Production (Real Stripe):
```typescript
const response = await fetch('/api/checkout/stripe', {
```

## 4. Test Stripe Webhook

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Forward webhooks to local: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Update `STRIPE_WEBHOOK_SECRET` with the webhook signing secret

## 5. Deploy to Production

The success page (`/success`) already handles both:
- **Simulated sessions**: `?session=encrypted_token`
- **Real Stripe sessions**: `?session_id=cs_live_xxx`

No additional changes needed!

## File Structure

```
/api/checkout/
├── simulate/    # Simulated checkout (development)
├── stripe/      # Real Stripe checkout (production)
└── verify/      # Stripe session verification
```

## That's It!

Your app is now ready to process real payments through Stripe. The `/success`, `/signup`, and `/dashboard` pages will work seamlessly with real Stripe data.
