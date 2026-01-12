# Vercel Environment Variables Setup Guide

## 🚨 CRITICAL - Add These First

```bash
# Email Service (REQUIRED for verification emails)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Site URL (REQUIRED for email links)
NEXT_PUBLIC_APP_URL=https://archeryrangescanada.ca
```

---

## 📧 Email Configuration (Recommended)

```bash
RESEND_FROM_EMAIL=noreply@archeryrangescanada.com
RESEND_REPLY_TO_EMAIL=support@archeryrangescanada.com
```

---

## 🔄 Update These for Production

```bash
# Change from localhost to production URL
NEXT_PUBLIC_BASE_URL=https://archeryrangescanada.ca
NEXT_PUBLIC_SITE_URL=https://archeryrangescanada.ca
```

---

## 💳 Stripe (Update to Production Keys)

```bash
# Use LIVE keys for production (change from test keys)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Price IDs (use production IDs)
STRIPE_SILVER_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_GOLD_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PLATINUM_PRICE_ID=price_xxxxxxxxxxxxx
```

---

## 🗄️ Supabase (Copy from .env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://eiarfecnutloupdyapkx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🤖 AI Services (Copy from .env.local)

```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxx
```

---

## 📊 Optional (Analytics)

```bash
IP_SALT=random_secure_string_for_hashing
```

---

## ⚙️ How to Add in Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select your project: `archery-ranges-canada`
3. Click: **Settings** → **Environment Variables**
4. For each variable:
   - **Key:** Variable name (e.g., `RESEND_API_KEY`)
   - **Value:** Your secret value
   - **Environment:** Select **Production**, **Preview**, and **Development**
   - Click **Save**

---

## ✅ Verification Checklist

After adding all variables:

- [ ] RESEND_API_KEY added
- [ ] NEXT_PUBLIC_APP_URL added (production URL)
- [ ] NEXT_PUBLIC_BASE_URL updated to production
- [ ] NEXT_PUBLIC_SITE_URL updated to production
- [ ] Stripe keys updated to production (sk_live_, pk_live_)
- [ ] Stripe webhook secret updated
- [ ] All price IDs use production values
- [ ] Supabase credentials copied
- [ ] AI service keys copied
- [ ] All variables set for Production, Preview, Development

---

## 🔐 Security Notes

- ✅ Never commit `.env.local` to git
- ✅ Use different keys for development vs production
- ✅ Rotate API keys periodically
- ✅ Keep Stripe webhook secret secure
- ✅ Use production Stripe keys only in production environment

---

## 🧪 Test After Adding

```bash
# Deploy and test these endpoints:
curl https://archeryrangescanada.ca/api/health

# Should return:
# {"status":"healthy","timestamp":"...","services":{...}}
```

---

**Last Updated:** 2026-01-11
