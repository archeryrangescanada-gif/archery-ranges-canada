# Fix Production Authentication Redirect Issue

## 🔴 Current Problem
When users click Google OAuth on archeryrangescanada.ca, they get redirected back to localhost:3000 instead of staying on the production domain.

## ✅ Complete Solution (Follow in Order)

### Step 1: Update Supabase Configuration

1. Go to https://supabase.com/dashboard
2. Select your project: **Archery Ranges Canada**
3. Navigate to **Authentication** → **URL Configuration**
4. Update the following:

   **Site URL:**
   ```
   https://archeryrangescanada.ca
   ```

   **Redirect URLs:** (Make sure ALL these are listed)
   ```
   http://localhost:3000/**
   https://archeryrangescanada.ca/**
   https://*.vercel.app/**
   ```

5. Click **Save changes**

---

### Step 2: Update Production Environment Variables

#### If deployed on Vercel:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables (select **Production** environment):

```bash
NEXT_PUBLIC_BASE_URL=https://archeryrangescanada.ca
NEXT_PUBLIC_SITE_URL=https://archeryrangescanada.ca
NEXT_PUBLIC_APP_URL=https://archeryrangescanada.ca
```

5. Also make sure these exist (copy from .env.local if needed):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://eiarfecnutloupdyapkx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your key from .env.local]
SUPABASE_SERVICE_ROLE_KEY=[your key from .env.local]
ANTHROPIC_API_KEY=[your key]
GEMINI_API_KEY=[your key]
RESEND_API_KEY=[your key]
RESEND_FROM_EMAIL="Archery Ranges Canada <noreply@archeryrangescanada.ca>"
RESEND_REPLY_TO_EMAIL="support@archeryrangescanada.ca"

# Stripe - For production, you need LIVE keys!
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[pk_live_ or pk_test_]
STRIPE_SECRET_KEY=[sk_live_ or sk_test_]
STRIPE_WEBHOOK_SECRET=[whsec_...]
STRIPE_SILVER_PRICE_ID=price_prod_TXFE6vExrepcED
STRIPE_GOLD_PRICE_ID=price_prod_TXFGcCPC1dVt9o
STRIPE_PLATNIUM_PRICE_ID=price_prod_TXFGknKPSVXtHJ

DATABASE_URL="postgresql://postgres.eiarfecnutloupdyapkx:1uJJWaN6RSuWgjwe@aws-1-ca-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

#### If deployed on Netlify:

1. Go to https://app.netlify.com
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Add all the variables listed above for Vercel

---

### Step 3: Redeploy Your Application

After adding environment variables:

**In Vercel:**
1. Go to **Deployments**
2. Click the three dots (...) next to the latest deployment
3. Click **Redeploy**

**In Netlify:**
1. Go to **Deploys**
2. Click **Trigger deploy** → **Deploy site**

---

### Step 4: Clean Up Local Environment (Optional but Recommended)

Replace your `.env.local` file with the clean version:

1. Backup your current `.env.local`:
   ```bash
   cp .env.local .env.local.backup
   ```

2. Copy the clean version:
   ```bash
   cp .env.local.clean .env.local
   ```

3. Restart your local dev server:
   ```bash
   npm run dev
   ```

---

## 🧪 Testing After Fix

### Test on Production (archeryrangescanada.ca):

1. Go to https://archeryrangescanada.ca
2. Click "Sign In"
3. Click "Continue with Google"
4. Select your Google account
5. ✅ You should be redirected to `https://archeryrangescanada.ca` (NOT localhost)
6. ✅ You should be logged in

### Test on Localhost (still works):

1. Go to http://localhost:3000
2. Click "Sign In"
3. Click "Continue with Google"
4. Select your Google account
5. ✅ You should be redirected to `http://localhost:3000`
6. ✅ You should be logged in

---

## ❓ Troubleshooting

### Problem: Still redirecting to localhost
**Solution:**
- Make sure you redeployed after adding environment variables
- Check browser cache - try in incognito mode
- Verify environment variables are set in production (not preview)

### Problem: "Invalid redirect URL" error
**Solution:**
- Double-check the redirect URLs in Supabase include `https://archeryrangescanada.ca/**`
- Make sure there's no typo in the domain name

### Problem: Environment variables not working
**Solution:**
- Make sure they're set for "Production" environment, not "Preview"
- Variable names must be EXACT (case-sensitive)
- Redeploy after adding variables

### Problem: Localhost development stopped working
**Solution:**
- Make sure `.env.local` has `NEXT_PUBLIC_BASE_URL=http://localhost:3000`
- Restart your dev server: `npm run dev`

---

## 📝 Key Points to Remember

1. **Local Development** (.env.local):
   - Uses `http://localhost:3000`
   - Uses Stripe TEST keys
   - Never committed to git

2. **Production** (Vercel/Netlify environment variables):
   - Uses `https://archeryrangescanada.ca`
   - Should use Stripe LIVE keys for real transactions
   - Set in hosting platform dashboard

3. **Supabase Settings**:
   - Site URL: `https://archeryrangescanada.ca` (for production)
   - Redirect URLs: Include BOTH localhost AND production

4. **After ANY environment variable change**:
   - Always redeploy!
   - Variables are only loaded during build time

---

## 🎯 Current Status

After following this guide:
- ✅ Production auth redirects to archeryrangescanada.ca
- ✅ Local development still works on localhost:3000
- ✅ Users can sign in with Google on production
- ✅ No more "requested path is invalid" errors

---

## 🔐 Security Notes

⚠️ **Important:** You're currently using Stripe TEST mode keys in production. Before accepting real payments:

1. Go to Stripe Dashboard → Developers → API keys
2. Get your **LIVE** mode keys (pk_live_ and sk_live_)
3. Update production environment variables
4. Test with a real card (not 4242 4242...)

---

Need help? The issue is that environment variables weren't set for production, causing it to use localhost defaults.
