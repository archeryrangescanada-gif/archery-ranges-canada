# 🔒 Phase 1 Security Audit - FAILED

**Date**: 2026-01-08
**Auditor**: Claude Code
**Status**: ❌ **CRITICAL FAILURES - DO NOT DEPLOY**

---

## Executive Summary

The application has **FAILED** Phase 1 security verification. Critical security vulnerabilities remain unpatched. **DO NOT proceed to Phase 2 or deploy to production** until all items below are resolved.

**Risk Level**: 🔴 **CRITICAL**
**Deployment Status**: **BLOCKED**

---

## Critical Failures (Must Fix Immediately)

### ❌ 1. Admin Authentication Completely Disabled

**File**: `src/middleware.ts` (lines 15-21)
**Severity**: 🔴 **CRITICAL**
**Status**: **FAIL**

#### Problem
Authentication code is still commented out. All admin routes are publicly accessible without any login required.

#### Current Code
```typescript
// Lines 15-21 in src/middleware.ts
// Get the admin token from cookies
// const token = request.cookies.get('admin-token')?.value

// If no token, redirect to login
// if (!token) {
//   return NextResponse.redirect(new URL('/admin/login', request.url))
// }
```

#### Impact
- ⚠️ Anyone can access `/admin/dashboard` without logging in
- ⚠️ Anyone can access `/admin/listings` and delete all listings
- ⚠️ Anyone can access `/admin/claims` and approve fake business claims
- ⚠️ Anyone can access `/admin/users` and modify user roles
- ⚠️ All admin API routes are unprotected

#### Required Fix
**Uncomment the authentication code and implement proper Supabase session checking:**

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/admin')) {
    // Allow access to login page
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Create Supabase client
    let response = NextResponse.next()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Check for valid session
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

**Estimated Fix Time**: 1-2 hours
**Testing Required**: Test all admin routes with and without session

---

### ❌ 2. SSRF Vulnerability in AI Extract Endpoint

**File**: `src/app/api/admin/listings/ai-extract/route.ts` (lines 53-62)
**Severity**: 🔴 **CRITICAL**
**Status**: **FAIL**

#### Problem
The endpoint accepts ANY URL from user input and fetches it without validation, timeout, or size limits.

#### Current Code
```typescript
// Line 53: Accepts ANY URL
const { url } = await request.json()

// Line 62: Fetches without validation or timeout
const webResponse = await fetch(url)
const html = await webResponse.text() // Could be 100MB+
```

#### Vulnerabilities
- ❌ No domain whitelisting
- ❌ No localhost/internal IP blocking
- ❌ No timeout (will cause Vercel timeout)
- ❌ No content-size limit
- ❌ Can be used to scan internal network
- ❌ Can be used to attack other services

#### Attack Examples
```bash
# Attacker can scan internal network
POST /api/admin/listings/ai-extract
{"url": "http://192.168.1.1"}

# Attacker can access internal admin routes
POST /api/admin/listings/ai-extract
{"url": "http://localhost:3000/admin/users"}

# Attacker can cause infinite hang
POST /api/admin/listings/ai-extract
{"url": "http://slowserver.com/never-responds"}
```

#### Required Fix

**Add URL validation, timeout, and size limits:**

```typescript
// src/app/api/admin/listings/ai-extract/route.ts

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error: GEMINI_API_KEY not found' },
        { status: 500 }
      )
    }

    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // ✅ VALIDATE URL
    let urlObj: URL
    try {
      urlObj = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // ✅ BLOCK INTERNAL/PRIVATE IPs
    const hostname = urlObj.hostname.toLowerCase()
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
    ]

    // Block localhost and private IP ranges
    if (
      blockedHosts.includes(hostname) ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.20.') ||
      hostname.startsWith('172.21.') ||
      hostname.startsWith('172.22.') ||
      hostname.startsWith('172.23.') ||
      hostname.startsWith('172.24.') ||
      hostname.startsWith('172.25.') ||
      hostname.startsWith('172.26.') ||
      hostname.startsWith('172.27.') ||
      hostname.startsWith('172.28.') ||
      hostname.startsWith('172.29.') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.')
    ) {
      return NextResponse.json(
        { error: 'Cannot fetch from internal/private networks' },
        { status: 400 }
      )
    }

    // ✅ ONLY ALLOW HTTP/HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return NextResponse.json(
        { error: 'Only HTTP/HTTPS URLs are allowed' },
        { status: 400 }
      )
    }

    console.log(`🚀 START: Fetching HTML from: ${url}`)

    // ✅ ADD TIMEOUT with AbortController
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    let webResponse: Response
    try {
      webResponse = await fetch(url, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'ArcheryRangesCanada-Bot/1.0',
        },
      })
      clearTimeout(timeoutId)
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout - page took too long to respond' },
          { status: 504 }
        )
      }
      throw error
    }

    if (!webResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${webResponse.status} ${webResponse.statusText}` },
        { status: 400 }
      )
    }

    // ✅ CHECK CONTENT LENGTH
    const contentLength = webResponse.headers.get('content-length')
    const MAX_SIZE = 5_000_000 // 5MB

    if (contentLength && parseInt(contentLength) > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Page too large (max 5MB)' },
        { status: 413 }
      )
    }

    // ✅ STREAM WITH SIZE LIMIT
    const reader = webResponse.body?.getReader()
    if (!reader) {
      return NextResponse.json({ error: 'Failed to read response' }, { status: 500 })
    }

    const chunks: Uint8Array[] = []
    let totalSize = 0

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        totalSize += value.length
        if (totalSize > MAX_SIZE) {
          reader.cancel()
          return NextResponse.json(
            { error: 'Page too large (max 5MB)' },
            { status: 413 }
          )
        }

        chunks.push(value)
      }
    } finally {
      reader.releaseLock()
    }

    const html = new TextDecoder().decode(Buffer.concat(chunks))
    console.log(`✅ HTML DOWNLOADED: ${html.length} characters`)

    // ... rest of your existing cheerio and Gemini code ...

  } catch (error: any) {
    console.error('❌ AI Extract Error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to extract data',
        details: error.toString(),
      },
      { status: 500 }
    )
  }
}
```

**Estimated Fix Time**: 2-3 hours
**Testing Required**: Test with valid URLs, blocked IPs, timeouts, large pages

---

### ❌ 3. No Input Validation on Admin API Routes

**Files**: Multiple admin API routes
**Severity**: 🔴 **CRITICAL**
**Status**: **FAIL**

#### Problem
Admin API routes accept arbitrary JSON input without validation, allowing attackers to inject malicious data.

---

#### 3.1 `/api/admin/listings/[id]` Route

**File**: `src/app/api/admin/listings/[id]/route.ts` (lines 25-28)

**Current Code** (VULNERABLE):
```typescript
// Line 25: Accepts ENTIRE body without filtering
const body = await request.json()
const updates = { ...body, updated_at: new Date().toISOString() }

// Line 30: Passes everything to database
const { data, error } = await adminSupabase
  .from('ranges')
  .update(updates) // ❌ Can update ANY column!
  .eq('id', id)
```

**Attack Example**:
```bash
# Attacker can steal ownership of any listing
PATCH /api/admin/listings/123
{
  "owner_id": "attacker-user-id",
  "is_featured": true,
  "stripe_subscription_id": "fake-sub-id"
}
```

**Required Fix**:
```typescript
// src/app/api/admin/listings/[id]/route.ts

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const body = await request.json()

    // ✅ WHITELIST allowed fields
    const allowedFields = [
      'name',
      'slug',
      'city_id',
      'province_id',
      'address',
      'postal_code',
      'latitude',
      'longitude',
      'phone_number',
      'email',
      'website',
      'description',
      'tags',
      'business_hours',
      'range_length_yards',
      'number_of_lanes',
      'facility_type',
      'has_pro_shop',
      'has_3d_course',
      'has_field_course',
      'equipment_rental_available',
      'lessons_available',
      'accessibility',
      'parking_available',
      'membership_required',
      'membership_price_adult',
      'drop_in_price',
      'lesson_price_range',
      'bow_types_allowed',
      'is_featured', // Admin can toggle featured status
      'status', // Admin can change status
    ]

    // ✅ FILTER to only allowed fields
    const updates: Record<string, any> = {}
    for (const key of Object.keys(body)) {
      if (allowedFields.includes(key)) {
        updates[key] = body[key]
      }
    }

    // ✅ VALIDATE field types
    if (updates.latitude && typeof updates.latitude !== 'number') {
      return NextResponse.json(
        { error: 'latitude must be a number' },
        { status: 400 }
      )
    }

    if (updates.longitude && typeof updates.longitude !== 'number') {
      return NextResponse.json(
        { error: 'longitude must be a number' },
        { status: 400 }
      )
    }

    if (updates.facility_type && !['Indoor', 'Outdoor', 'Both'].includes(updates.facility_type)) {
      return NextResponse.json(
        { error: 'facility_type must be Indoor, Outdoor, or Both' },
        { status: 400 }
      )
    }

    // Add timestamp
    updates.updated_at = new Date().toISOString()

    const { data, error } = await adminSupabase
      .from('ranges')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(`❌ Error updating listing ${id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    console.error('❌ Update API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

---

#### 3.2 `/api/admin/users` Route

**File**: `src/app/api/admin/users/route.ts` (lines 54-64)

**Current Code** (VULNERABLE):
```typescript
const { id, role, status } = body

const updates: any = {}
if (role) updates.role = role  // ❌ No validation on 'role'
if (status) updates.status = status  // ❌ No validation on 'status'
```

**Required Fix**:
```typescript
// src/app/api/admin/users/route.ts

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, role, status } = body

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // ✅ VALIDATE role enum
    const validRoles = ['user', 'admin', 'owner']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    // ✅ VALIDATE status enum
    const validStatuses = ['active', 'inactive', 'suspended']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const updates: Record<string, any> = {}
    if (role) updates.role = role
    if (status) updates.status = status
    updates.updated_at = new Date().toISOString()

    const { data, error } = await adminSupabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, user: data })

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Estimated Fix Time**: 4-6 hours (all routes)
**Testing Required**: Test with valid/invalid inputs for each field

---

### ❌ 4. Missing Production Environment Variables

**Severity**: 🔴 **CRITICAL**
**Status**: **PARTIAL**

#### Problem
Local `.env.local` has some variables, but Vercel production environment is missing critical variables. Also using TEST Stripe keys instead of LIVE keys.

#### Current Status (Local)
```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ ANTHROPIC_API_KEY
✅ GEMINI_API_KEY
⚠️ STRIPE keys (using TEST keys - pk_test_, sk_test_)
❌ RESEND_API_KEY (MISSING)
❌ FROM_EMAIL (MISSING)
❌ NEXT_PUBLIC_SITE_URL (using localhost)
❌ NEXT_PUBLIC_APP_URL (using localhost)
```

#### Required Action

**Add ALL 26 environment variables to Vercel:**

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables for **Production**, **Preview**, and **Development**:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://eiarfecnutloupdyapkx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application URLs (CHANGE TO PRODUCTION)
NEXT_PUBLIC_SITE_URL=https://archeryrangescanada.ca
NEXT_PUBLIC_APP_URL=https://archeryrangescanada.ca

# Stripe (CHANGE TO LIVE KEYS)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # NOT pk_test_
STRIPE_SECRET_KEY=sk_live_...  # NOT sk_test_
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...  # Your live price ID
STRIPE_SILVER_PRICE_ID=price_...
STRIPE_GOLD_PRICE_ID=price_...
STRIPE_PLATNIUM_PRICE_ID=price_...

# Email (Resend) - GET THESE FROM RESEND DASHBOARD
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@archeryrangescanada.ca

# AI Services
ANTHROPIC_API_KEY=sk-ant-api03-...
GEMINI_API_KEY=AIzaSy...

# Admin
ADMIN_PASSWORD=<create-a-secure-password>
```

#### Critical Notes

⚠️ **STRIPE TEST vs LIVE KEYS**:
- Your `.env.local` has TEST keys (`pk_test_`, `sk_test_`)
- Production MUST use LIVE keys (`pk_live_`, `sk_live_`)
- Get live keys from: https://dashboard.stripe.com/apikeys
- Update webhook endpoint in Stripe to production URL

⚠️ **RESEND EMAIL**:
- Get API key from: https://resend.com/api-keys
- Verify domain `archeryrangescanada.ca` in Resend
- Set FROM_EMAIL to verified domain

**Estimated Fix Time**: 30 minutes
**Testing Required**: Deploy to Vercel preview, test all integrations

---

## Summary of Required Fixes

| Issue | Severity | File | Fix Time | Status |
|-------|----------|------|----------|--------|
| Admin Authentication | 🔴 Critical | `src/middleware.ts` | 1-2 hours | ❌ FAIL |
| SSRF Vulnerability | 🔴 Critical | `src/app/api/admin/listings/ai-extract/route.ts` | 2-3 hours | ❌ FAIL |
| Input Validation - Listings | 🔴 Critical | `src/app/api/admin/listings/[id]/route.ts` | 2 hours | ❌ FAIL |
| Input Validation - Users | 🔴 Critical | `src/app/api/admin/users/route.ts` | 1 hour | ❌ FAIL |
| Environment Variables | 🔴 Critical | Vercel Dashboard | 30 min | ⚠️ PARTIAL |

**Total Estimated Fix Time**: **6-8 hours**

---

## Testing Checklist

After implementing all fixes, test the following:

### Authentication Testing
- [ ] Cannot access `/admin/dashboard` without login
- [ ] Cannot access `/admin/listings` without login
- [ ] Cannot access `/admin/users` without login
- [ ] Login redirects to `/admin/dashboard` on success
- [ ] Logout clears session and redirects to `/admin/login`

### SSRF Protection Testing
- [ ] Cannot fetch `http://localhost:3000`
- [ ] Cannot fetch `http://192.168.1.1`
- [ ] Cannot fetch `http://127.0.0.1`
- [ ] Can fetch valid external URLs (e.g., archery range websites)
- [ ] Timeout triggers after 10 seconds for slow URLs
- [ ] Large pages (>5MB) are rejected with 413 error

### Input Validation Testing
- [ ] Cannot update `owner_id` via PATCH `/api/admin/listings/[id]`
- [ ] Cannot set invalid `facility_type` (e.g., "InvalidType")
- [ ] Cannot set invalid user `role` (e.g., "superadmin")
- [ ] Cannot set invalid user `status` (e.g., "banned")
- [ ] Valid updates work correctly

### Environment Variables Testing
- [ ] Stripe checkout uses LIVE keys (not test mode)
- [ ] Email verification sends from `noreply@archeryrangescanada.ca`
- [ ] AI extraction works in production
- [ ] All Supabase queries succeed

---

## Security Risk If Deployed Now

If you deploy to production WITHOUT fixing these issues:

1. ⚠️ **Anyone can access admin panel** - no login required
2. ⚠️ **Anyone can delete all your listings** - database destruction
3. ⚠️ **Anyone can approve fake business claims** - fraud
4. ⚠️ **Anyone can modify user roles** - privilege escalation
5. ⚠️ **Attackers can scan your internal network** - SSRF attacks
6. ⚠️ **Attackers can inject malicious data** - SQL injection risk
7. ⚠️ **Payments will fail** - using test Stripe keys
8. ⚠️ **Emails will fail** - missing Resend API key

---

## Recommendation

**🚫 DO NOT DEPLOY TO PRODUCTION**

**✅ REQUIRED ACTIONS**:
1. Fix all 4 critical security issues above
2. Add all 26 environment variables to Vercel
3. Switch to LIVE Stripe keys
4. Complete full testing checklist
5. Run `npm run build` locally to verify no errors
6. Deploy to Vercel preview environment first
7. Test preview environment thoroughly
8. Then deploy to production

---

## Next Steps After Phase 1 Completion

Once all Phase 1 fixes are verified and passing:
1. Re-run this security audit to confirm all issues resolved
2. Proceed to **Phase 2: Stability** (add timeouts, error handling)
3. Proceed to **Phase 3: Testing** (end-to-end testing)
4. Proceed to **Phase 4: Production Deployment**

---

**Report Generated**: 2026-01-08
**Audit Status**: ❌ **FAILED - DO NOT DEPLOY**
**Next Review**: After completing all fixes above

---

## Questions or Clarifications?

If you need help implementing any of these fixes, ask for:
- Specific code examples for each fix
- Testing strategies for each vulnerability
- Deployment checklist and verification steps
