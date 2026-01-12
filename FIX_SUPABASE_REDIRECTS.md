# 🔧 Fix Supabase Redirect URLs - Step by Step

## Issue
Getting 404 error with `localhost:3000/?code=...` in the URL on Vercel deployment.

**Root Cause:** Supabase is redirecting to `localhost:3000` instead of your production domain.

---

## ✅ Solution: Update Supabase Authentication URLs

### Step 1: Open Supabase Dashboard

1. Go to: **https://supabase.com/dashboard**
2. Select your project: **eiarfecnutloupdyapkx** (or find by name)
3. Click on your project to open it

### Step 2: Navigate to Authentication Settings

1. In the left sidebar, click: **Authentication**
2. At the top tabs, click: **URL Configuration**

### Step 3: Update Site URL

Find the **Site URL** field and update it to:

```
https://archeryrangescanada.ca
```

### Step 4: Add Redirect URLs

In the **Redirect URLs** section, add these URLs (one per line):

```
https://archeryrangescanada.ca/auth/callback
https://archeryrangescanada.ca/auth/login
https://archeryrangescanada.ca/dashboard
https://archeryrangescanada.ca/dashboard/onboarding
https://archeryrangescanada.ca/admin/login
```

**Also add your Vercel preview domains:**
```
https://*.vercel.app/auth/callback
https://*.vercel.app/auth/login
https://*.vercel.app/dashboard
```

### Step 5: Save Changes

Click the **Save** button at the bottom of the page.

---

## 🔧 Step 6: Update Vercel Environment Variables

### Go to Vercel Dashboard

1. Open: **https://vercel.com/dashboard**
2. Select your project: **archery-ranges-canada**
3. Click: **Settings** → **Environment Variables**

### Update These Variables

Find and update (or add if missing):

```bash
NEXT_PUBLIC_SITE_URL=https://archeryrangescanada.ca
NEXT_PUBLIC_BASE_URL=https://archeryrangescanada.ca
NEXT_PUBLIC_APP_URL=https://archeryrangescanada.ca
```

**Make sure to select all environments:**
- ✅ Production
- ✅ Preview
- ✅ Development

Click **Save** for each one.

---

## 🚀 Step 7: Redeploy

### Option A: Trigger from Vercel Dashboard
1. Go to: **Deployments** tab
2. Click on the latest deployment
3. Click: **•••** (three dots) → **Redeploy**

### Option B: Push to Git (Automatic)
```bash
# Make a small change to trigger deployment
git commit --allow-empty -m "trigger: redeploy after Supabase URL update"
git push origin main
```

---

## ✅ Step 8: Test the Fix

Wait 2-3 minutes for deployment to complete, then test:

### Test 1: Homepage
```
Visit: https://archeryrangescanada.ca
Should load without errors
```

### Test 2: Authentication Flow
```
1. Visit: https://archeryrangescanada.ca/auth/login
2. Try to sign in (or sign up)
3. After authentication, should redirect to:
   - /dashboard/onboarding (new users)
   - /dashboard (existing users)
4. URL should stay on archeryrangescanada.ca domain
5. No localhost:3000 should appear
```

### Test 3: Check URL After Login
After successful login, the URL should be:
```
✅ https://archeryrangescanada.ca/dashboard
❌ NOT: localhost:3000/?code=...
```

---

## 🐛 If Still Not Working

### Check 1: Verify Supabase Settings
1. Go back to Supabase Dashboard
2. Authentication → URL Configuration
3. Make sure **Site URL** is exactly: `https://archeryrangescanada.ca`
4. Make sure redirect URLs include your domain

### Check 2: Verify Vercel Environment Variables
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Check that these are set:
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_BASE_URL`
   - `NEXT_PUBLIC_APP_URL`
3. Values should be: `https://archeryrangescanada.ca` (no trailing slash)

### Check 3: Clear Browser Cache
1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Click "Empty Cache and Hard Reload"

### Check 4: Check Deployment Logs
1. Vercel Dashboard → Deployments
2. Click on latest deployment
3. Check for any errors in **Build Logs** or **Function Logs**

---

## 📸 Visual Guide: Supabase Settings

Your Supabase Authentication → URL Configuration should look like:

```
┌─────────────────────────────────────────────┐
│ Site URL                                     │
│ https://archeryrangescanada.ca              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Redirect URLs                                │
│ https://archeryrangescanada.ca/**           │
│ https://*.vercel.app/**                     │
│                                              │
│ [Add specific URLs listed above]            │
└─────────────────────────────────────────────┘
```

---

## 🎯 What This Fixes

**Before:**
- User logs in → Supabase redirects to `localhost:3000/?code=...`
- Gets 404 error
- Can't complete authentication

**After:**
- User logs in → Supabase redirects to `https://archeryrangescanada.ca/auth/callback?code=...`
- Auth callback processes the code
- Redirects to dashboard
- ✅ Works correctly!

---

## 📝 Additional Notes

### For Development
Keep `http://localhost:3000` in the redirect URLs for local development:
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/login
```

### For Multiple Domains
If you have multiple domains (e.g., staging), add them all:
```
https://staging.archeryrangescanada.ca/auth/callback
https://archeryrangescanada.vercel.app/auth/callback
```

---

## 🆘 Still Having Issues?

If the problem persists:

1. **Check Supabase Logs:**
   - Supabase Dashboard → Logs → Auth Logs
   - Look for failed authentication attempts

2. **Check Browser Console:**
   - Open DevTools (F12) → Console tab
   - Look for error messages

3. **Check Network Tab:**
   - DevTools → Network tab
   - Filter by "callback" or "auth"
   - See where redirects are going

4. **Verify Environment Variables Are Loaded:**
   - Add a console.log in your code temporarily
   - Check Vercel Function Logs

---

**Expected Time:** 5-10 minutes
**Difficulty:** Easy
**Status:** This will fix your 404 redirect issue

**Last Updated:** 2026-01-11
