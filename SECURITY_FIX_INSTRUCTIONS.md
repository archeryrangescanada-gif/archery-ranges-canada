# Security Fix Instructions

## Overview
Supabase Security Advisor identified several critical security issues in your database:
- **8 tables** without Row Level Security (RLS) enabled
- **5 functions** with mutable search paths (SQL injection risk)
- **3 RLS policies** that are overly permissive

This document explains how to fix all of these issues.

## ⚠️ CRITICAL: Backup First!

Before applying any fixes, **create a backup of your database**:

1. Go to your Supabase Dashboard
2. Navigate to Database → Backups
3. Create a manual backup or ensure you have a recent automatic backup

## Security Issues Identified

### 1. Tables Without RLS (Critical Risk)
These tables are currently accessible to anyone:
- `ad_placement_assignments`
- `ad_impressions`
- `ad_clicks`
- `announcement_clicks`
- `subscriptions`
- `subscription_plans`
- `admin_activity_logs`
- `blog_posts`

**Risk**: Unauthorized users could read, modify, or delete sensitive data.

### 2. Functions with Mutable Search Paths (Medium Risk)
These functions are vulnerable to SQL injection:
- `update_updated_at_column`
- `is_subscription_active`
- `get_effective_tier`
- `increment_view_count`
- `handle_new_user`

**Risk**: Attackers could manipulate the search path to execute malicious code.

### 3. Overly Permissive RLS Policies (Low-Medium Risk)
These policies use `USING (true)` which allows unrestricted access:
- `cities` - Public can modify cities (should be read-only)
- `range_analytics` - Anyone can view all range analytics (should be owner-only)
- `range_inquiries` - Anyone can view all inquiries (should be private)

**Risk**: Users could access or modify data they shouldn't have permission to.

## How to Apply the Fix

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **Archery Ranges Canada**
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Security Fix Script

1. Open the file `fix_security_issues.sql` from your project root
2. Copy the entire contents
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify the Fix

After running the script:

1. Go to **Database** → **Advisors** → **Security Advisor**
2. Click **Refresh** to re-run the analysis
3. Verify that all errors and warnings are resolved

You should see:
- ✅ 0 errors (was 8)
- ✅ 0 warnings (was 14)
- ✅ All tables have RLS enabled
- ✅ All functions have secure search paths

## What the Fix Does

### Part 1: Enable RLS on All Tables
```sql
ALTER TABLE public.ad_placement_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;
-- ... and 6 more tables
```

### Part 2: Create Secure RLS Policies

**Ad System Tables:**
- Public can view active ads (needed for website display)
- Only admins can create/modify/delete ads
- Anonymous users can track impressions/clicks (needed for analytics)
- Only admins can view analytics data

**Subscription Tables:**
- Public can view active subscription plans (pricing page)
- Users can view/create/update their own subscriptions
- Admins can manage all subscriptions

**Blog & Admin Tables:**
- Public can view published blog posts
- Admins can manage all blog posts
- Only admins can view admin activity logs

### Part 3: Fix Function Security

All functions are updated with:
```sql
SECURITY DEFINER
SET search_path = public
```

This prevents SQL injection attacks by fixing the search path.

### Part 4: Tighten Overly Permissive Policies

**Cities:**
- Changed from unrestricted write to read-only for public
- Only admins can add/modify cities

**Range Analytics:**
- Changed from public access to owner-only
- Range owners can view their own analytics
- Admins can view all analytics

**Range Inquiries:**
- Changed from public access to private
- Users can only view inquiries they sent
- Range owners can view inquiries to their ranges
- Admins can view all inquiries

## Testing After Fix

After applying the security fix, test these critical features:

### 1. Test Anonymous (Logged Out) Access
- [ ] Homepage loads correctly
- [ ] Can view archery ranges
- [ ] Can view cities and provinces
- [ ] Can view blog posts
- [ ] Can view pricing/subscription plans
- [ ] Ad impressions are tracked (check analytics later)

### 2. Test Regular User Access
- [ ] Can sign up and log in
- [ ] Can create range inquiry
- [ ] Can view own subscriptions
- [ ] Can subscribe to a plan
- [ ] Cannot access admin features

### 3. Test Range Owner Access
- [ ] Can claim a range
- [ ] Can view own range analytics
- [ ] Can view inquiries to their range
- [ ] Cannot view other ranges' analytics

### 4. Test Admin Access
- [ ] Can access admin dashboard
- [ ] Can manage blog posts
- [ ] Can manage ads
- [ ] Can view all analytics
- [ ] Can view admin activity logs

## Rollback Plan

If something breaks after applying the fix:

### Option 1: Restore from Backup
1. Go to Database → Backups
2. Select the backup from before the fix
3. Click Restore

### Option 2: Disable RLS Temporarily (Not Recommended)
```sql
-- ONLY use this for debugging, then re-enable immediately
ALTER TABLE public.table_name DISABLE ROW LEVEL SECURITY;
```

### Option 3: Modify Specific Policies
If only certain features break, you can modify individual policies:
```sql
-- Example: Make a table temporarily more permissive
DROP POLICY "policy_name" ON public.table_name;
CREATE POLICY "temporary_open_policy"
  ON public.table_name
  FOR ALL
  USING (true);  -- WARNING: This is insecure!
```

## Common Issues & Solutions

### Issue: "Permission denied for table X"
**Solution**: The RLS policy is too restrictive. Check if the user should have access.

### Issue: "Function X does not exist"
**Solution**: The function may not exist in your database. Comment out that section in the fix script.

### Issue: Admin can't access their own features
**Solution**: Make sure your admin user has `role = 'admin'` in the `profiles` table:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```

### Issue: Anonymous users can't view the website
**Solution**: Check that anonymous access is enabled in Supabase settings:
1. Go to Authentication → Settings
2. Ensure "Enable anonymous sign-ins" is OFF (we don't use it)
3. Public read access is granted via RLS policies, not anonymous auth

## Additional Security Recommendations

After fixing these issues, consider:

1. **Enable Database Audit Logging**
   - Go to Database → Audit Logs
   - Monitor for suspicious activity

2. **Set Up Alerts**
   - Configure alerts for failed authentication attempts
   - Monitor for unusual database queries

3. **Regular Security Audits**
   - Run Security Advisor monthly
   - Review and update RLS policies as features change

4. **Environment Variables**
   - Never commit `.env` files to git
   - Use Supabase Vault for sensitive keys
   - Rotate API keys regularly

5. **Rate Limiting**
   - Implement rate limiting on public endpoints
   - Protect against brute force attacks

## Support

If you encounter issues:

1. Check the Supabase logs: Dashboard → Logs
2. Review the Security Advisor: Database → Advisors → Security Advisor
3. Consult Supabase docs: https://supabase.com/docs/guides/auth/row-level-security
4. Ask in Supabase Discord: https://discord.supabase.com

## Summary

**Before Fix:**
- 🔴 8 tables without RLS
- ⚠️ 5 vulnerable functions
- ⚠️ 3 overly permissive policies
- ❌ Database exposed to unauthorized access

**After Fix:**
- ✅ All tables have RLS enabled
- ✅ All functions secured against SQL injection
- ✅ All policies follow principle of least privilege
- ✅ Database properly secured

**Estimated Time:** 10-15 minutes
**Risk Level:** Low (with backup)
**Priority:** HIGH - Apply ASAP for production security
