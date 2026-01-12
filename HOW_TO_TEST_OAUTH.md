# 🔐 How to Test OAuth - Step-by-Step Guide

**Purpose:** Verify Google and Facebook OAuth login works correctly in production
**Time Required:** 10-15 minutes
**Difficulty:** Easy

---

## 🎯 What You're Testing

**OAuth Flow:**
```
User clicks "Continue with Google"
  ↓
Redirects to Google login page
  ↓
User selects Google account
  ↓
Google redirects back to your site: /api/auth/callback?code=...
  ↓
Your app exchanges code for session
  ↓
User redirected to /dashboard or /dashboard/onboarding
  ↓
User is logged in! ✅
```

---

## ✅ Pre-Testing Checklist

Before you start testing, verify:

### 1. Deployment is Ready
- [ ] Go to: https://vercel.com/dashboard
- [ ] Find commit `cb27a82` (or latest)
- [ ] Status shows: **"Ready"** ✅
- [ ] Build succeeded with no critical errors

### 2. Supabase OAuth is Configured
- [ ] Go to: https://supabase.com/dashboard
- [ ] Project: **eiarfecnutloupdyapkx**
- [ ] Authentication → URL Configuration
- [ ] Site URL: `https://archeryrangescanada.ca` ✅
- [ ] Redirect URLs include: `https://archeryrangescanada.ca/**` ✅

### 3. Environment Variables Set
- [ ] Vercel → Settings → Environment Variables
- [ ] `NEXT_PUBLIC_APP_URL` = `https://archeryrangescanada.ca` ✅
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = (your Supabase URL) ✅
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your anon key) ✅

---

## 🧪 Test 1: Google OAuth (New User)

**Goal:** Test the complete OAuth flow for a new user

### Step 1: Prepare Test Environment
```bash
# Open an INCOGNITO/PRIVATE browser window
# Why? To ensure you're not already logged in
```

**Browser:**
- Chrome/Edge: `Ctrl + Shift + N` (Windows) or `Cmd + Shift + N` (Mac)
- Firefox: `Ctrl + Shift + P` (Windows) or `Cmd + Shift + P` (Mac)
- Safari: `Cmd + Shift + N` (Mac)

### Step 2: Navigate to Login Page
```
URL: https://archeryrangescanada.ca/auth/login
```

**What You Should See:**
- ✅ Login page loads correctly
- ✅ "Continue with Google" button visible
- ✅ "Continue with Facebook" button visible
- ✅ Email/password form visible
- ✅ Input fields have dark/visible text (not white on white)

**Screenshot This:** Take a screenshot for reference

### Step 3: Click "Continue with Google"

**Action:** Click the **"Continue with Google"** button

**What Should Happen:**
```
1. Page redirects to: accounts.google.com
2. You see Google's login/account selection page
```

**If it doesn't redirect:**
- Check browser console (F12) for errors
- Verify the button has an onClick handler
- Check network tab for failed requests

### Step 4: Select Google Account

**Action:**
- Select a Google account (or sign in if needed)
- Click "Continue" or "Allow"

**What Should Happen:**
```
Google redirects to: https://archeryrangescanada.ca/api/auth/callback?code=abc123...
```

**Watch the URL Bar Carefully:**
- You'll briefly see `/api/auth/callback?code=...`
- This should happen fast (< 1 second)

### Step 5: Verify Redirect to Dashboard

**Expected Final URL:**
```
For NEW users (first time):
https://archeryrangescanada.ca/dashboard/onboarding

For EXISTING users:
https://archeryrangescanada.ca/dashboard
```

**What You Should See:**
- ✅ Dashboard page loads
- ✅ No error messages
- ✅ You're logged in (see user menu/profile)
- ✅ URL doesn't have `?code=` in it

### Step 6: Verify Session Persistence

**Action:** Refresh the page (F5)

**Expected:**
- ✅ Still logged in
- ✅ Don't get redirected to login
- ✅ Dashboard loads correctly

**Action:** Open new tab, go to: `https://archeryrangescanada.ca`

**Expected:**
- ✅ Still logged in on homepage
- ✅ See "Dashboard" or profile link in header

---

## ✅ Test 2: Google OAuth (Existing User)

**Goal:** Test login for users who already have an account

### Step 1: Log Out
```
URL: https://archeryrangescanada.ca
```

**Find and click:** "Sign Out" or "Log Out" button

**Verify:**
- ✅ Redirected to homepage or login page
- ✅ User menu/profile is gone
- ✅ See "Sign In" button

### Step 2: Repeat Test 1 Steps 2-6

**Expected Difference:**
```
Since you already have an account:
→ Should redirect to: /dashboard (not /dashboard/onboarding)
```

**All other behavior:** Same as Test 1

---

## 🧪 Test 3: Facebook OAuth

**Same as Google OAuth, but:**

### Differences:
1. Click **"Continue with Facebook"** instead
2. Redirects to `facebook.com` instead of Google
3. Otherwise, flow is identical

**Expected Behavior:**
- Same redirect chain
- Same dashboard destination
- Same session persistence

---

## 🐛 Test 4: Error Scenarios

**Goal:** Make sure errors are handled gracefully

### Scenario 1: Cancel OAuth

**Steps:**
1. Go to login page
2. Click "Continue with Google"
3. On Google page, click **"Cancel"** or back button

**Expected:**
- ✅ Redirected back to: `/auth/login`
- ✅ See error message (optional)
- ✅ Can try again

### Scenario 2: Denied Permissions

**Steps:**
1. Go to login page
2. Click "Continue with Google"
3. On Google page, click **"Deny"** or don't grant permissions

**Expected:**
- ✅ Redirected to: `/auth/login?error=...`
- ✅ Error message displayed
- ✅ Can try again

---

## 📊 Test Results - What Success Looks Like

### ✅ All These Should Work:

**Login Flow:**
- [x] Login page loads and displays correctly
- [x] "Continue with Google" button redirects to Google
- [x] Can select Google account
- [x] Redirects to `/api/auth/callback?code=...`
- [x] Immediately redirects to `/dashboard` or `/dashboard/onboarding`
- [x] User is logged in

**Session:**
- [x] Session persists after page refresh
- [x] Session works across different pages
- [x] Can log out successfully
- [x] Can log back in

**Error Handling:**
- [x] Canceling OAuth returns to login page
- [x] Error messages displayed when OAuth fails
- [x] Can retry after error

---

## 🔍 How to Check Vercel Logs

**If OAuth fails, check the logs to see what happened:**

### Step 1: Open Vercel Dashboard
```
URL: https://vercel.com/dashboard
```

**Find:**
- Your project: **archery-ranges-canada**
- Click it

### Step 2: Go to Functions Logs
```
Navigation: Deployments → Latest → Functions (or Runtime Logs)
```

### Step 3: Filter for Auth Callback
```
Search/Filter: "Auth callback" or "🔐"
```

### Step 4: Read the Logs

**Successful OAuth looks like:**
```
🔐 API Auth callback triggered
📍 API Auth callback params: { hasCode: true, ... }
🔄 Exchanging code for session...
✅ Code exchange successful
👤 Fetching user data...
✅ User found: abc-123-def-456
📊 User has 0 listings
↗️ Redirecting NEW user to onboarding
```

**Failed OAuth shows:**
```
❌ Code exchange failed: [error message]
```
or
```
❌ Failed to get user: [error message]
```

**Use this to diagnose issues!**

---

## 🚨 Common Issues & Fixes

### Issue 1: Redirects to Homepage with `?code=` in URL

**Symptom:**
```
End up at: https://archeryrangescanada.ca/?code=abc123
Instead of: /dashboard
```

**Cause:** Supabase redirect URL not configured

**Fix:**
1. Supabase Dashboard → Authentication → URL Configuration
2. Add: `https://archeryrangescanada.ca/api/auth/callback`
3. Or add wildcard: `https://archeryrangescanada.ca/**`
4. Save and wait 30 seconds
5. Try again in incognito

---

### Issue 2: "Could not authenticate" Error

**Symptom:**
```
Redirected to: /auth/login?error=Could not authenticate
```

**Possible Causes:**
1. Code exchange failed
2. Supabase credentials wrong
3. OAuth callback route not deployed

**Check Vercel Logs:**
- Look for "❌ Code exchange failed"
- Error message will tell you exactly what's wrong

**Common Fixes:**
- Verify Supabase URL and keys in Vercel
- Check Supabase redirect URLs include your domain
- Verify `/api/auth/callback` route exists and deployed

---

### Issue 3: Infinite Redirect Loop

**Symptom:**
```
Browser keeps redirecting between pages
URL changes rapidly
Eventually get "too many redirects" error
```

**Cause:** Middleware or auth logic issue

**Check:**
1. Browser console (F12) → Network tab
2. See which URLs are redirecting
3. Check Vercel logs for errors

**Fix:**
- Verify middleware isn't blocking dashboard access
- Check auth cookie is being set
- Ensure no conflicting redirects

---

### Issue 4: 404 on `/api/auth/callback`

**Symptom:**
```
After Google login, see 404 error
URL: /api/auth/callback?code=...
```

**Cause:** Route not deployed or misconfigured

**Fix:**
1. Verify file exists: `src/app/api/auth/callback/route.ts`
2. Check Vercel deployment includes this route
3. Rebuild and redeploy if needed

---

## 📝 Test Report Template

**After testing, fill this out:**

```markdown
## OAuth Test Results - [Date]

### Google OAuth
- [ ] Login page loads: ✅ / ❌
- [ ] Redirects to Google: ✅ / ❌
- [ ] Returns to callback: ✅ / ❌
- [ ] Redirects to dashboard: ✅ / ❌
- [ ] Session persists: ✅ / ❌

**Final URL:** _________________
**Status:** ✅ WORKING / ❌ FAILED

**Issues Encountered:**
_______________________________________

### Facebook OAuth
- [ ] Login page loads: ✅ / ❌
- [ ] Redirects to Facebook: ✅ / ❌
- [ ] Returns to callback: ✅ / ❌
- [ ] Redirects to dashboard: ✅ / ❌
- [ ] Session persists: ✅ / ❌

**Final URL:** _________________
**Status:** ✅ WORKING / ❌ FAILED

**Issues Encountered:**
_______________________________________

### Vercel Logs
- [ ] Checked logs: YES / NO
- [ ] Found errors: YES / NO

**Log Excerpt:**
```
[Paste relevant logs here]
```

### Overall Status
**OAuth Working:** ✅ YES / ❌ NO
**Ready for Production:** ✅ YES / ❌ NO

**Notes:**
_______________________________________
```

---

## 🎯 Success Criteria

**OAuth is working when ALL of these pass:**

1. ✅ Login page loads without errors
2. ✅ "Continue with Google" redirects to Google
3. ✅ After Google login, redirects to `/api/auth/callback`
4. ✅ Callback immediately redirects to `/dashboard`
5. ✅ User is logged in (can see their profile)
6. ✅ Session persists after refresh
7. ✅ Can log out and log back in
8. ✅ Vercel logs show successful auth flow
9. ✅ No errors in browser console
10. ✅ Same flow works for Facebook

**If all 10 pass:** 🎉 **OAuth is working perfectly!**

---

## 📞 Next Steps After Testing

### If OAuth Works:
1. ✅ Mark deployment as successful
2. ✅ Test other features (admin, payments, etc.)
3. ✅ Monitor logs for 24-48 hours
4. ✅ Celebrate! 🎉

### If OAuth Fails:
1. ❌ Check Vercel logs (most important!)
2. ❌ Verify Supabase configuration
3. ❌ Check browser console for errors
4. ❌ Try the fixes listed above
5. ❌ Share error logs for help

---

**Testing Time:** 10-15 minutes
**Difficulty:** Easy
**Importance:** Critical - Must work before launch!

**Good luck with testing! 🚀**
