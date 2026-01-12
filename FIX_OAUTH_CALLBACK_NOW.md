# 🚨 URGENT FIX - OAuth Callback Going to Homepage

## The Problem
Your screenshot shows: `archeryrangescanada.ca/?code=b2c62e7b...`

This means Google OAuth is redirecting to your **homepage** instead of `/auth/callback`.

**Root Cause:** Supabase Site URL is set incorrectly in your Supabase Dashboard.

---

## ✅ IMMEDIATE FIX - 2 Minutes

### Step 1: Open Supabase Dashboard
1. Go to: **https://supabase.com/dashboard/project/eiarfecnutloupdyapkx**
2. Or go to https://supabase.com/dashboard and click your project

### Step 2: Go to Authentication Settings
1. Click: **Authentication** (left sidebar)
2. Click: **URL Configuration** (top tabs)

### Step 3: Update Site URL

**CRITICAL:** Change the **Site URL** from whatever it is now to:

```
https://archeryrangescanada.ca
```

**⚠️ IMPORTANT:** No trailing slash! Just `https://archeryrangescanada.ca`

### Step 4: Update Redirect URLs

In the **Redirect URLs** section, add these (one per line):

```
https://archeryrangescanada.ca/api/auth/callback
https://archeryrangescanada.ca/auth/callback
https://archeryrangescanada.ca/dashboard
https://archeryrangescanada.ca/dashboard/onboarding
https://*.vercel.app/api/auth/callback
https://*.vercel.app/auth/callback
http://localhost:3000/api/auth/callback
http://localhost:3000/auth/callback
```

**OR use wildcards (recommended):**

```
https://archeryrangescanada.ca/**
https://*.vercel.app/**
http://localhost:3000/**
```

### Step 5: Click Save

Click the **Save** button at the bottom.

---

## 🧪 Test Immediately (No Code Changes Needed!)

1. Wait **30 seconds** for Supabase to update
2. Open **new incognito window**
3. Go to: `https://archeryrangescanada.ca/auth/login`
4. Click **"Continue with Google"**
5. Complete Google sign-in

### Expected Result:
```
✅ URL should be: https://archeryrangescanada.ca/auth/callback?code=...
✅ Then redirect to: /dashboard or /dashboard/onboarding
```

### Current (Broken):
```
❌ URL is: https://archeryrangescanada.ca/?code=...
❌ User stays on homepage
```

---

## 🔍 Why This Happens

Supabase uses the **Site URL** as the base for OAuth redirects. If it's set to:
- `https://archeryrangescanada.ca` → Redirects to `https://archeryrangescanada.ca/auth/callback` ✅
- `http://localhost:3000` → Redirects to `http://localhost:3000/?code=...` ❌ (in production!)
- Empty or wrong → Redirects to homepage ❌

---

## 📸 What Your Supabase Settings Should Look Like

```
┌─────────────────────────────────────────────────────────────┐
│ Site URL                                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://archeryrangescanada.ca                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Redirect URLs                                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://archeryrangescanada.ca/**                       │ │
│ │ https://*.vercel.app/**                                 │ │
│ │ http://localhost:3000/**                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ [Save] button                                                │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist

- [ ] Opened Supabase Dashboard
- [ ] Navigated to Authentication → URL Configuration
- [ ] Changed Site URL to `https://archeryrangescanada.ca`
- [ ] Added redirect URLs (with wildcards `/**` or specific paths)
- [ ] Clicked Save
- [ ] Waited 30 seconds
- [ ] Tested in incognito window
- [ ] OAuth now redirects to `/auth/callback` instead of homepage

---

## 🆘 If Still Not Working

### Check 1: Verify Site URL Saved
- Go back to Supabase Dashboard → Authentication → URL Configuration
- Confirm Site URL shows: `https://archeryrangescanada.ca`
- If it reverted, there may be a validation error (check for typos)

### Check 2: Check Google Cloud Console
- Go to: https://console.cloud.google.com/apis/credentials
- Find your OAuth 2.0 Client ID
- Check "Authorized redirect URIs"
- Should include: `https://eiarfecnutloupdyapkx.supabase.co/auth/v1/callback`

### Check 3: Clear Browser Cache
- Open DevTools (F12)
- Right-click refresh button
- Click "Empty Cache and Hard Reload"

---

## 🎯 Bottom Line

**You don't need to change any code.**
**You don't need to redeploy.**
**You just need to update the Supabase Site URL setting.**

This is a **configuration issue**, not a code issue. Once the Site URL is correct in Supabase, OAuth will automatically redirect to the right place.

---

**Time to Fix:** 2 minutes
**Difficulty:** Easy (just update one field)
**Confidence:** 100% this will fix it

**Go do it now and test! 🚀**
