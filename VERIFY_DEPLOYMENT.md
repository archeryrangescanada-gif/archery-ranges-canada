# ✅ Deployment Verification Checklist

## 📦 Commits Deployed

- `b7a6cb7` - **Main Fix:** Build failures + login form styling
- `231dc91` - OAuth API route
- `b8ab2e7` - Documentation (current)

---

## 🔍 Step-by-Step Verification

### Step 1: Check Vercel Build Status (2 minutes)

1. Open: **https://vercel.com/dashboard**
2. Find your project: **archery-ranges-canada**
3. Check latest deployment (commit `b8ab2e7` or `b7a6cb7`)

**Look for:**
- ✅ Status shows **"Ready"** (green checkmark)
- ✅ Build time: ~1-2 minutes
- ✅ No errors in build logs

**If Build Failed:**
- Click deployment → **Build Logs** tab
- Look for error messages in red
- Most likely issue: Missing environment variables
- Report the error message

---

### Step 2: Verify Homepage Loads

**Action:**
```
Open: https://archeryrangescanada.ca
```

**Expected:**
- ✅ Page loads within 2 seconds
- ✅ No error messages
- ✅ Search bar visible
- ✅ Province/city listings appear

**Check Browser Console (F12):**
- ✅ No JavaScript errors (red text)
- ✅ No 404 or 500 errors in Network tab

---

### Step 3: Check Login Page

**Action:**
```
Open: https://archeryrangescanada.ca/auth/login
```

**Expected:**
- ✅ Page loads correctly
- ✅ "Continue with Google" button visible
- ✅ Email input field visible
- ✅ Password input field visible
- ✅ **Input text is DARK/VISIBLE** (not white on white)

**Test Input Visibility:**
1. Click in email field
2. Type something (e.g., "test@example.com")
3. ✅ **Text should be dark gray/black and clearly visible**
4. Try password field too
5. ✅ **Password dots/text should be visible**

---

### Step 4: Test OAuth Flow (CRITICAL)

**Action:**
1. Open **new incognito/private window**
2. Go to: `https://archeryrangescanada.ca/auth/login`
3. Click: **"Continue with Google"**
4. Complete Google authentication

**Expected Flow:**
```
1. Redirect to Google OAuth page ✅
2. Select Google account ✅
3. Redirect to: https://archeryrangescanada.ca/api/auth/callback?code=... ✅
4. Redirect to: /dashboard/onboarding (new user) OR /dashboard (existing) ✅
5. User is logged in! ✅
```

**If it fails:**
- Note the URL you end up at
- Check browser console for errors
- Go to Step 5 to check Vercel logs

---

### Step 5: Check Vercel Function Logs

**Action:**
1. Go to: **Vercel Dashboard** → **archery-ranges-canada**
2. Click: **Deployments** → Latest deployment
3. Click: **Functions** tab (or **Runtime Logs**)
4. Look for logs with 🔐 emoji

**Expected Logs:**
```
🔐 API Auth callback triggered
📍 API Auth callback params: { hasCode: true, next: null, origin: "https://archeryrangescanada.ca", fullUrl: "..." }
🔄 Exchanging code for session...
✅ Code exchange successful
👤 Fetching user data...
✅ User found: <user-id>
📊 User has 0 listings
↗️ Redirecting NEW user to onboarding
```

**If you see errors:**
- ❌ Code exchange failed → Supabase redirect URLs issue
- ❌ Failed to get user → Database/auth issue
- ⚠️ No authorization code provided → OAuth config issue

---

## 📊 Quick Health Check Commands

### Test API Health Endpoint
```bash
curl https://archeryrangescanada.ca/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-11T...",
  "services": {
    "database": { "status": "up", "responseTime": 45 },
    "api": { "status": "up", "uptime": 12345.67 }
  }
}
```

---

## ✅ Success Criteria

Deployment is successful when **ALL** of these pass:

### Build
- [x] Vercel build status: **Ready** ✅
- [x] Build logs: **0 errors** ✅
- [x] Deployment time: **< 3 minutes** ✅

### Pages Load
- [x] Homepage loads without errors ✅
- [x] Login page loads correctly ✅
- [x] Input fields have visible text ✅

### OAuth Works
- [x] Google OAuth redirects to `/api/auth/callback` ✅
- [x] Callback processes the code ✅
- [x] User redirects to dashboard ✅
- [x] User is logged in ✅

### No Errors
- [x] No console errors ✅
- [x] No build errors ✅
- [x] Function logs show success ✅

---

## 🐛 Common Issues & Quick Fixes

### Issue 1: Build Still Failing
**Symptom:** Vercel shows "Failed" status

**Quick Check:**
- Environment variables set in Vercel?
- `SUPABASE_SERVICE_ROLE_KEY` present?
- `NEXT_PUBLIC_SUPABASE_URL` present?

**Fix:** Go to Vercel → Settings → Environment Variables → Add missing vars

---

### Issue 2: Input Text Still White
**Symptom:** Can't see what you're typing in login form

**Quick Check:**
- Hard refresh the page (Ctrl + Shift + R)
- Clear browser cache
- Try different browser

**If still broken:** The new styles didn't deploy - check deployment commit hash

---

### Issue 3: OAuth Still Redirects to Homepage
**Symptom:** After Google login, end up at `/?code=...`

**Quick Fix:**
1. Go to Supabase Dashboard
2. Authentication → URL Configuration
3. Verify redirect URLs include:
   - `https://archeryrangescanada.ca/**`
4. Click Save
5. Wait 30 seconds
6. Try again in incognito

---

### Issue 4: "Could not authenticate" Error
**Symptom:** Redirected back to login with error message

**Check Vercel Logs:**
- Look for the ❌ error in function logs
- Error message will tell you exactly what failed
- Most common: Code exchange failed → check Supabase URL config

---

## 📸 What Working OAuth Looks Like

### In Browser Address Bar:
```
Step 1: https://archeryrangescanada.ca/auth/login
        ↓ Click "Continue with Google"
Step 2: https://accounts.google.com/...
        ↓ Select account
Step 3: https://archeryrangescanada.ca/api/auth/callback?code=abc123...
        ↓ Process (happens fast)
Step 4: https://archeryrangescanada.ca/dashboard/onboarding
        ✅ LOGGED IN!
```

### In Vercel Function Logs:
```
🔐 API Auth callback triggered
📍 Auth callback params: { hasCode: true, ... }
🔄 Exchanging code for session...
✅ Code exchange successful, session created
👤 Fetching user data...
✅ User found: abc-123-def-456
📊 User has 0 listings
↗️ Redirecting NEW user to onboarding
```

---

## 🎯 Report Back

After going through this checklist, report:

1. **Build Status:** ✅ Ready / ❌ Failed
2. **Homepage:** ✅ Works / ❌ Error
3. **Login Page:** ✅ Text visible / ❌ Still white
4. **OAuth:** ✅ Works / ❌ Failed (describe what happened)
5. **Vercel Logs:** (Copy the auth callback logs if OAuth failed)

---

**Time Estimate:** 5-10 minutes for full verification
**Priority:** Test OAuth flow - that's the critical fix!

Good luck! 🚀
