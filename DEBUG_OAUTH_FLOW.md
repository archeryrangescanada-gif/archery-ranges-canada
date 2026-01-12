# 🔍 Debug OAuth Redirect Issue - Testing Guide

**Issue:** After Google sign-in, users redirect to homepage instead of dashboard

**Commit:** `244e0b7` - Added comprehensive logging to auth callback

**Date:** 2026-01-11

---

## ✅ Step 1: Wait for Deployment

1. Go to: **https://vercel.com/dashboard**
2. Select project: **archery-ranges-canada**
3. Click: **Deployments** tab
4. Wait for commit `244e0b7` to show **"Ready"** status (2-3 minutes)

---

## 🧪 Step 2: Test Google Sign-In Flow

### Test with Real User Account

1. **Open Incognito/Private Window** (to avoid cached sessions)
2. Navigate to: `https://archeryrangescanada.ca/auth/login`
3. Click: **"Continue with Google"** button
4. Complete Google authentication
5. **Watch what happens:**
   - Where does it redirect?
   - Do you see any error messages?
   - Check the URL bar for any parameters

### Expected Behavior
```
✅ CORRECT:
User clicks Google sign-in
→ Redirects to Google OAuth
→ User approves
→ Redirects to https://archeryrangescanada.ca/auth/callback?code=...
→ Callback exchanges code for session
→ Redirects to /dashboard/onboarding (new users) OR /dashboard (existing users)

❌ CURRENT (BROKEN):
User clicks Google sign-in
→ Redirects to Google OAuth
→ User approves
→ ??? Something fails here ???
→ User ends up on homepage (/)
```

---

## 📊 Step 3: Check Vercel Function Logs

This is the **MOST IMPORTANT** step - the logs will tell us exactly what's failing!

### How to Access Logs

1. Go to: **https://vercel.com/dashboard**
2. Select: **archery-ranges-canada** project
3. Click: **Deployments** tab
4. Click on the **latest deployment** (commit `244e0b7`)
5. Click: **Functions** tab (or **Runtime Logs**)
6. Filter by: `/api/auth/callback` or search for "Auth callback"

### What to Look For in Logs

#### Scenario A: Successful Code Exchange
```
🔐 Auth callback triggered
📍 Auth callback params: { hasCode: true, next: null, origin: "https://...", ... }
🔄 Exchanging code for session...
✅ Code exchange successful, session created
👤 Fetching user data...
✅ User found: <user-id>
📊 User has 0 listings
↗️ Redirecting NEW user to onboarding
```
**If you see this:** The callback is working! Issue is elsewhere (maybe middleware intercepting?)

#### Scenario B: Code Exchange Fails
```
🔐 Auth callback triggered
📍 Auth callback params: { hasCode: true, ... }
🔄 Exchanging code for session...
❌ Code exchange failed: <error message>
↗️ Redirecting to login with error (fallback)
```
**If you see this:** Supabase OAuth is misconfigured. Check redirect URLs in Supabase dashboard.

#### Scenario C: No Code in URL
```
🔐 Auth callback triggered
📍 Auth callback params: { hasCode: false, ... }
⚠️ No authorization code provided
↗️ Redirecting to login with error (fallback)
```
**If you see this:** Google isn't sending the code back. Check redirect URL configuration.

#### Scenario D: User Not Found After Session
```
🔐 Auth callback triggered
✅ Code exchange successful, session created
👤 Fetching user data...
❌ Failed to get user: <error>
```
**If you see this:** Session created but user lookup failed. Database issue.

---

## 🔧 Step 4: Common Fixes Based on Logs

### Fix 1: If Code Exchange Fails

**Root Cause:** Supabase redirect URLs not configured

**Solution:**
1. Go to: **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Verify **Site URL** is: `https://archeryrangescanada.ca`
3. Add to **Redirect URLs**:
   ```
   https://archeryrangescanada.ca/auth/callback
   https://archeryrangescanada.ca/dashboard
   https://archeryrangescanada.ca/dashboard/onboarding
   ```
4. Click **Save**
5. Wait 2 minutes for changes to propagate
6. Test again

### Fix 2: If No Code in URL

**Root Cause:** Google OAuth redirectTo is wrong

**Check in Supabase Dashboard:**
1. Go to: **Authentication** → **Providers** → **Google**
2. Verify **Redirect URL** matches what Google Console expects
3. Check Google Cloud Console OAuth settings:
   - Authorized redirect URIs should include your Supabase callback URL

### Fix 3: If Session Created But User Not Found

**Root Cause:** Database permissions or Supabase config

**Solution:**
```sql
-- Run in Supabase SQL Editor to check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'ranges';

-- Verify the ranges table has correct policies
```

### Fix 4: If Callback Works But Still Redirects to Home

**Root Cause:** Middleware intercepting redirect

**Check:** `src/middleware.ts` - ensure it's not redirecting authenticated users from /dashboard

---

## 🐛 Step 5: Additional Debugging

### Check Browser Console

1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for any client-side errors
4. Check **Network** tab:
   - Filter by "callback"
   - Look at request/response
   - Check redirect chain

### Check Cookies

1. Open DevTools → **Application** tab → **Cookies**
2. Look for Supabase auth cookies:
   - `sb-<project-id>-auth-token`
   - Should be set after successful OAuth
3. If missing → Session not created
4. If present → Check middleware logic

### Test Email/Password Login (Comparison)

1. Create a test account with email/password
2. Log in using email/password (not OAuth)
3. Does this redirect to dashboard correctly?
4. If YES → OAuth-specific issue
5. If NO → General redirect issue

---

## 📝 Expected Log Output (Full Success)

```
🔐 Auth callback triggered
📍 Auth callback params: {
  hasCode: true,
  next: null,
  origin: "https://archeryrangescanada.ca",
  fullUrl: "https://archeryrangescanada.ca/auth/callback?code=abc123..."
}
🔄 Exchanging code for session...
✅ Code exchange successful, session created
👤 Fetching user data...
✅ User found: a1b2c3d4-e5f6-7890-abcd-ef1234567890
📊 User has 0 listings
↗️ Redirecting NEW user to onboarding

[Next log from /dashboard/onboarding page loading]
```

---

## 🎯 What To Report Back

After testing, please report:

1. **Where did you end up?** (homepage, dashboard, login, other?)
2. **URL in address bar** (copy exact URL with any parameters)
3. **Logs from Vercel** (copy the auth callback logs)
4. **Browser console errors** (any red errors in DevTools?)
5. **Did you see an error message?** (screenshot if possible)

This information will tell me exactly what's failing and how to fix it!

---

## 🆘 Quick Reference

| **What You See** | **What It Means** | **Next Step** |
|------------------|-------------------|---------------|
| Homepage with no error | Callback worked but redirected wrong | Check middleware, check logs for redirect path |
| Login page with error | Code exchange failed | Fix Supabase redirect URLs |
| 404 page | Invalid callback URL | Check Supabase Site URL |
| Stuck on "loading" | JavaScript error | Check browser console |
| Google error page | OAuth misconfigured | Check Google Console settings |

---

**Testing Time:** ~5 minutes
**Expected Fix Time:** 5-10 minutes after identifying root cause

**Good luck! The logs will tell us everything we need to know! 🔍**
