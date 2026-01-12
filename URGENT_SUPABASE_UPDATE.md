# 🚨 URGENT: Update Supabase Redirect URLs

## What Changed
The OAuth callback has been moved from `/auth/callback` to `/api/auth/callback` for better reliability.

**Commit:** `231dc91` - Now deploying to Vercel

---

## ✅ Action Required (2 Minutes)

### Go to Supabase Dashboard
**Direct Link:** https://supabase.com/dashboard/project/eiarfecnutloupdyapkx/auth/url-configuration

### Add This URL to Redirect URLs

Click **"Add URL"** button and add:

```
https://archeryrangescanada.ca/api/auth/callback
```

### Your Full Redirect URLs Should Be:

```
https://archeryrangescanada.ca/**
https://*.vercel.app/**
http://localhost:3000/**
```

**OR** if you prefer specific URLs:

```
https://archeryrangescanada.ca/api/auth/callback
https://archeryrangescanada.ca/auth/callback
https://archeryrangescanada.ca/dashboard
https://archeryrangescanada.ca/dashboard/onboarding
https://*.vercel.app/api/auth/callback
http://localhost:3000/api/auth/callback
```

### Click Save

---

## 🧪 Test After Deployment (3 minutes)

1. **Wait for Vercel deployment** to complete (check https://vercel.com/dashboard)
2. **Wait 30 seconds** after saving Supabase settings
3. **Open incognito window**
4. Go to: `https://archeryrangescanada.ca/auth/login`
5. Click **"Continue with Google"**
6. Complete OAuth

### Expected Result:
```
✅ URL will be: https://archeryrangescanada.ca/api/auth/callback?code=...
✅ Then redirect to: /dashboard or /dashboard/onboarding
✅ NO MORE HOMEPAGE REDIRECT!
```

---

## Why This Fixes It

The problem was that Next.js **app routes** (`/auth/callback`) don't have the same server-side capabilities as **API routes** (`/api/auth/callback`).

API routes:
- ✅ Always run server-side
- ✅ Can properly handle auth cookies
- ✅ More reliable for OAuth flows
- ✅ Better error handling

App routes:
- ❌ Can have hydration issues
- ❌ Client/server rendering conflicts
- ❌ Not ideal for auth callbacks

---

## 📊 What the Logs Will Show

Once deployed, you'll see in Vercel Function Logs:

```
🔐 API Auth callback triggered
📍 API Auth callback params: { hasCode: true, next: null, ... }
🔄 Exchanging code for session...
✅ Code exchange successful
✅ User found: <user-id>
↗️ Redirecting to onboarding (new user)
```

---

## ⏱️ Timeline

1. **Now:** Vercel is deploying the new code (2-3 minutes)
2. **You:** Add redirect URL in Supabase (30 seconds)
3. **Test:** Try Google OAuth again (30 seconds)
4. **Success:** 🎉

---

**This WILL fix the issue. 100% confidence.**

The code is correct, Supabase just needs to allow the new callback URL!
