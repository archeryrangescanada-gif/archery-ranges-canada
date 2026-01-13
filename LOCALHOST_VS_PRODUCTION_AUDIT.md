# Localhost vs Production Audit Report
**Date:** 2026-01-13
**Issue:** Search API works on localhost but fails in Vercel production

---

## ✅ What Works on Localhost

### Environment Setup
```
NEXT_PUBLIC_SUPABASE_URL=✅ SET
SUPABASE_SERVICE_ROLE_KEY=✅ SET
NEXT_PUBLIC_SUPABASE_ANON_KEY=✅ SET
```

### Search API Behavior
1. **Request:** `GET /api/ranges/search?q=easthill`
2. **Response:** `200 OK`
3. **Data Returned:**
```json
{
  "ranges": [{
    "id": "68d6f320-5b69-42c4-80cb-0607c3c2f577",
    "name": "Easthill Outdoors",
    "address": "4131 Highway 35/115",
    "facility_type": "Indoor",
    "owner_id": null,
    "cities": {"name": "Orono"},
    "provinces": {"name": "Ontario"}
  }]
}
```

### Code Flow (Localhost)
1. Frontend calls `/api/ranges/search?q=easthill`
2. Route handler: `src/app/api/ranges/search/route.ts`
3. Imports: `getSupabaseAdmin()` from `src/lib/supabase-admin.ts`
4. Environment variables loaded from `.env.local` file
5. `process.env.SUPABASE_SERVICE_ROLE_KEY` ✅ **EXISTS**
6. Supabase admin client created successfully
7. Query executes: `SELECT ... FROM ranges WHERE owner_id IS NULL AND name ILIKE '%easthill%'`
8. Results returned to frontend

---

## ❌ What Fails on Production (Vercel)

### Current Error
```json
{
  "error": "Missing SUPABASE_SERVICE_ROLE_KEY environment variable"
}
```

### Vercel Environment Variables
From screenshot:
- `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGci...` ✅ **IS SET** in Vercel dashboard
- Environment: **Production, Preview, and Development** ✅
- Updated: **12/7/25**

### Code Flow (Production - FAILING)
1. Frontend calls `/api/ranges/search?q=easthill`
2. Route handler: `src/app/api/ranges/search/route.ts`
3. Imports: `getSupabaseAdmin()` from `src/lib/supabase-admin.ts`
4. Environment variables should be injected by Vercel
5. `process.env.SUPABASE_SERVICE_ROLE_KEY` ❌ **UNDEFINED**
6. Error thrown: "Missing SUPABASE_SERVICE_ROLE_KEY"

---

## 🔍 Root Cause Analysis

### Why Localhost Works
- Next.js dev server (`npm run dev`) loads environment variables from `.env.local`
- All `process.env.*` variables are available in API routes
- No build/bundling issues with environment variables

### Why Production Fails
**Hypothesis 1: Vercel Environment Variable Not Injected**
- Environment variable is set in Vercel dashboard ✅
- But `process.env.SUPABASE_SERVICE_ROLE_KEY` is `undefined` at runtime ❌
- Possible causes:
  1. Variable name mismatch (extra spaces, wrong case)
  2. Variable not enabled for "Production" environment
  3. Deployment built before variable was set
  4. Next.js edge runtime stripping variables

**Hypothesis 2: Edge Runtime vs Node.js Runtime**
- Vercel defaults to Edge runtime for API routes
- Edge runtime has limited `process.env` access
- **SOLUTION:** Added `export const runtime = 'nodejs'` ✅

**Hypothesis 3: Server-Only Package Issue**
- The `'server-only'` package should prevent client bundling ✅
- This is working correctly (error message is from our code)

---

## 🛠️ Current Code Configuration

### `src/lib/supabase-admin.ts`
```typescript
import 'server-only' // ✅ Prevents client-side imports
import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
                                  process.env.ARCHERY_ADMIN_SERVICE_KEY // ✅ Fallback added

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!supabaseServiceRoleKey) {
    // ✅ Enhanced error with debugging
    const envKeys = Object.keys(process.env).sort().join(', ')
    const hasNextPublic = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const debugMsg = `Env check: NEXT_PUBLIC=${hasNextPublic}, Keys=${envKeys}`
    throw new Error(`Missing SUPABASE_SERVICE_ROLE_KEY. ${debugMsg}`)
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
```

### `src/app/api/ranges/search/route.ts`
```typescript
export const dynamic = 'force-dynamic'  // ✅ Force dynamic rendering
export const runtime = 'nodejs'         // ✅ Use Node.js runtime (not Edge)

export async function GET(request: NextRequest) {
  const supabase = getSupabaseAdmin()  // Calls secure admin client
  // ... rest of search logic
}
```

---

## 🎯 Next Steps to Debug

### 1. Check Vercel Runtime Logs
- Go to: Vercel Dashboard → Functions → Runtime Logs
- Look for: `[Search API] Starting search request`
- Check if the enhanced error message shows available env keys

### 2. Verify Environment Variable Name
- Ensure EXACT match: `SUPABASE_SERVICE_ROLE_KEY`
- No leading/trailing spaces
- Correct capitalization

### 3. Try Alternative Variable Name
- You've added fallback: `ARCHERY_ADMIN_SERVICE_KEY`
- Add this in Vercel with the same value as backup

### 4. Force Fresh Deployment
- Go to: Vercel → Deployments → Latest
- Click "..." → **Redeploy**
- **Uncheck** "Use existing build cache"
- This ensures environment variables are re-injected

### 5. Check for Build-Time vs Runtime Access
- Environment variables in Vercel are available at **runtime**
- Next.js might be trying to access them at **build time**
- The `runtime: 'nodejs'` should fix this

---

## 📊 Comparison Matrix

| Feature | Localhost | Production (Vercel) |
|---------|-----------|---------------------|
| Environment File | `.env.local` ✅ | Vercel Dashboard ✅ |
| Variable Access | Direct `process.env` ✅ | Injected by Vercel ❓ |
| Runtime | Node.js Dev Server ✅ | Node.js (forced) ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Available ✅ | Missing ❌ |
| Search API Response | 200 OK ✅ | 500 Error ❌ |
| Server-Only Protection | Working ✅ | Working ✅ |

---

## ✅ Confirmed Working Features

1. ✅ Code logic is correct (works on localhost)
2. ✅ Database queries work (verified with Easthill Outdoors)
3. ✅ Server-only protection working (error is from our code)
4. ✅ Runtime forced to Node.js
5. ✅ Fallback environment variable added

---

## ❌ Still Needs Investigation

1. ❌ Why Vercel is not injecting `SUPABASE_SERVICE_ROLE_KEY`
2. ❓ Check if variable name has hidden characters
3. ❓ Verify deployment is using latest commit with fallback
4. ❓ Check Vercel runtime logs for enhanced error message
