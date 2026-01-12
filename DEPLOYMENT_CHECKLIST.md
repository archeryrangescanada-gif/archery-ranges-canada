# 🚀 Vercel Deployment Checklist

**Commit:** `9607f2b` - fix: production readiness - all critical issues resolved
**Status:** ✅ Code pushed to GitHub
**Date:** 2026-01-11

---

## ✅ Pre-Deployment Completed

- [x] All TypeScript errors fixed (0 errors)
- [x] Code committed to git
- [x] Pushed to GitHub (main branch)
- [x] Vercel deployment triggered automatically

---

## ⚠️ CRITICAL - Add These Environment Variables in Vercel NOW

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Select: `archery-ranges-canada` project
3. Click: **Settings** → **Environment Variables**

### Step 2: Add Missing Variables

#### 🚨 CRITICAL (Required for build)
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=https://archeryrangescanada.ca
```

#### 📧 Recommended (Email config)
```bash
RESEND_FROM_EMAIL=noreply@archeryrangescanada.com
RESEND_REPLY_TO_EMAIL=support@archeryrangescanada.com
```

#### 🔄 Update These (Change from localhost)
```bash
NEXT_PUBLIC_BASE_URL=https://archeryrangescanada.ca
NEXT_PUBLIC_SITE_URL=https://archeryrangescanada.ca
```

#### 💳 Stripe Production Keys (if ready)
```bash
# Change from test keys to live keys:
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx (new webhook for production)

# Use production price IDs:
STRIPE_SILVER_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_GOLD_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PLATINUM_PRICE_ID=price_xxxxxxxxxxxxx
```

### Step 3: Verify Environment Selection
For each variable, make sure to select:
- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

---

## 🗄️ Database Migration Required

### Apply in Supabase Production Database

1. **Go to:** Supabase Dashboard → SQL Editor
2. **Copy content from:** `supabase_import_ranges_transaction.sql`
3. **Paste and Run**

### Verification Query
```sql
-- Verify the function was created:
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'import_ranges_batch';

-- Expected result: 1 row showing the function exists
```

---

## 🧪 Post-Deployment Testing

### Step 1: Wait for Deployment
- Vercel will automatically deploy when you push to main
- Check deployment status: https://vercel.com/dashboard
- Wait for "Ready" status (usually 2-3 minutes)

### Step 2: Health Check
```bash
# Test the health endpoint:
curl https://archeryrangescanada.ca/api/health

# Expected response (200 OK):
{
  "status": "healthy",
  "timestamp": "2026-01-11T...",
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "up",
      "responseTime": 45
    },
    "api": {
      "status": "up",
      "uptime": 12345.67
    }
  }
}
```

### Step 3: Test Critical Features

#### Homepage
- [ ] Visit: https://archeryrangescanada.ca
- [ ] Page loads without errors
- [ ] Search bar visible and functional
- [ ] No console errors in browser DevTools

#### Search Functionality
- [ ] Search for a city (e.g., "Toronto")
- [ ] Results appear
- [ ] Click on a result
- [ ] City page loads

#### Admin Panel (Authentication Test)
- [ ] Visit: https://archeryrangescanada.ca/admin
- [ ] Should redirect to: `/admin/login`
- [ ] Login page displays
- [ ] Try accessing `/admin/dashboard` directly
- [ ] Should redirect back to login if not authenticated

#### Error Boundary Test
- [ ] Visit a non-existent page: https://archeryrangescanada.ca/nonexistent
- [ ] Should show 404 or error boundary
- [ ] "Go Home" button works
- [ ] "Try Again" button works

#### Performance Check
- [ ] Open Chrome DevTools
- [ ] Go to Lighthouse tab
- [ ] Run audit on homepage
- [ ] Target: Performance >90, Accessibility >90

---

## 🐛 If Build Fails

### Common Issues & Fixes

#### Issue 1: Missing Environment Variables
**Symptom:** Build fails with "RESEND_API_KEY is not defined"
**Fix:** Code now handles this gracefully - check Vercel logs

#### Issue 2: TypeScript Errors
**Symptom:** Build fails with TS errors
**Fix:** Run locally: `npx tsc --noEmit` (should show 0 errors)

#### Issue 3: Database Connection Failed
**Symptom:** Health check returns `"status": "unhealthy"`
**Fix:** Verify Supabase credentials in Vercel env vars

#### Issue 4: Module Not Found
**Symptom:** "Cannot find module '@supabase/ssr'"
**Fix:** Check package.json - should be in dependencies

### View Deployment Logs
1. Go to: Vercel Dashboard → Deployments
2. Click on latest deployment
3. View: **Build Logs** tab
4. Look for errors in red

---

## 🔄 Rollback Plan (If Needed)

### Option 1: Instant Rollback in Vercel
1. Go to: Vercel Dashboard → Deployments
2. Find previous successful deployment (commit: `92fd6a2`)
3. Click: **•••** → **Promote to Production**

### Option 2: Git Revert
```bash
git revert 9607f2b
git push origin main
```

---

## ✅ Success Criteria

Deployment is successful when ALL these pass:

### Build & Deployment
- [ ] Vercel build completes successfully
- [ ] No errors in build logs
- [ ] Deployment shows "Ready" status
- [ ] Preview URL accessible

### Functionality
- [ ] Homepage loads (<2s)
- [ ] Search returns results
- [ ] City pages load
- [ ] Admin login redirects work
- [ ] Health check returns 200
- [ ] No console errors

### Performance
- [ ] Lighthouse Performance >85
- [ ] First Contentful Paint <2s
- [ ] Time to Interactive <3.5s

### Security
- [ ] Admin routes require authentication
- [ ] API routes respond correctly
- [ ] No exposed secrets in client code
- [ ] HTTPS enabled

---

## 📊 Monitoring Setup (After Deployment)

### Recommended Services

1. **Uptime Monitoring**
   - Service: UptimeRobot (free tier)
   - Monitor: `https://archeryrangescanada.ca/api/health`
   - Alert when: Status ≠ 200 or response contains "unhealthy"

2. **Error Tracking**
   - Service: Sentry (optional)
   - Integration: Add Sentry to Next.js
   - Track: Runtime errors, API failures

3. **Analytics**
   - Vercel Analytics: Already enabled
   - Google Analytics: Add if needed
   - Monitor: Page views, bounce rate, load times

---

## 📞 Support Resources

### Documentation
- 📄 [PRODUCTION_READY_REPORT.md](PRODUCTION_READY_REPORT.md)
- 📄 [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md)
- 📄 [PHASE_3_COMPLETE.md](PHASE_3_COMPLETE.md)

### Quick Links
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
- GitHub Repo: https://github.com/archeryrangescanada-gif/archery-ranges-canada

### If Issues Persist
1. Check Vercel deployment logs
2. Check browser console for errors
3. Review [PRODUCTION_READY_REPORT.md](PRODUCTION_READY_REPORT.md)
4. Verify all environment variables are set

---

## 🎉 Next Steps After Successful Deployment

1. **Monitor First 24 Hours**
   - Watch error logs
   - Check uptime
   - Monitor performance

2. **Set Up Alerts**
   - Uptime monitoring
   - Error tracking
   - Performance degradation

3. **Update DNS (if needed)**
   - Point domain to Vercel
   - Configure SSL certificate
   - Verify HTTPS works

4. **Test Payment Flow**
   - If using production Stripe keys
   - Test subscription checkout
   - Verify webhook handling

5. **User Acceptance Testing**
   - Test all critical user flows
   - Check email notifications
   - Verify admin functions

---

**Deployment Time:** ~5 minutes (automatic from GitHub push)
**Testing Time:** ~15-20 minutes
**Total Time:** ~25 minutes

**Good luck with the deployment! 🚀**
