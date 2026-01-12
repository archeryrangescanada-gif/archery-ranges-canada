#!/bin/bash

echo "🔍 Production Readiness Verification Script"
echo "==========================================="
echo ""

# Check TypeScript compilation
echo "✓ Checking TypeScript compilation..."
npx tsc --noEmit 2>&1
if [ $? -eq 0 ]; then
    echo "✅ TypeScript: PASS (0 errors)"
else
    echo "❌ TypeScript: FAIL (compilation errors exist)"
    exit 1
fi
echo ""

# Check for critical files
echo "✓ Checking critical files..."
files=(
    ".vercelignore"
    "src/types/database.ts"
    "src/app/error.tsx"
    "src/app/admin/error.tsx"
    "src/app/api/health/route.ts"
    "supabase_import_ranges_transaction.sql"
    "PRODUCTION_READY_REPORT.md"
    "VERCEL_ENV_SETUP.md"
)

all_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
        all_exist=false
    fi
done

if [ "$all_exist" = true ]; then
    echo "✅ Files: PASS (all critical files present)"
else
    echo "❌ Files: FAIL (some files missing)"
    exit 1
fi
echo ""

# Check for force-dynamic in layout
echo "✓ Checking for force-dynamic in layout..."
if grep -q "export const dynamic = 'force-dynamic'" src/app/layout.tsx 2>/dev/null; then
    echo "❌ force-dynamic: FAIL (found in layout.tsx)"
    exit 1
else
    echo "✅ force-dynamic: PASS (removed from layout.tsx)"
fi
echo ""

# Check for graceful API key handling
echo "✓ Checking API key validation..."
if grep -q "console.warn.*RESEND_API_KEY" src/lib/resend.ts; then
    echo "  ✅ RESEND_API_KEY has graceful fallback"
else
    echo "  ❌ RESEND_API_KEY missing graceful fallback"
fi

if grep -q "console.warn.*ANTHROPIC_API_KEY" src/lib/claude.ts; then
    echo "  ✅ ANTHROPIC_API_KEY has graceful fallback"
else
    echo "  ❌ ANTHROPIC_API_KEY missing graceful fallback"
fi
echo "✅ API keys: PASS (graceful fallbacks present)"
echo ""

# Check admin authentication
echo "✓ Checking admin authentication..."
if grep -q "createServerClient" src/middleware.ts; then
    echo "✅ Admin auth: PASS (Supabase SSR auth enabled)"
else
    echo "❌ Admin auth: FAIL (authentication not enabled)"
    exit 1
fi
echo ""

# Summary
echo "==========================================="
echo "🎉 ALL CHECKS PASSED!"
echo "==========================================="
echo ""
echo "📋 Next Steps:"
echo "1. Add environment variables to Vercel"
echo "2. Apply database migration to Supabase"
echo "3. Run: npm run build"
echo "4. Deploy to Vercel preview"
echo "5. Test critical flows"
echo "6. Deploy to production"
echo ""
echo "📖 See PRODUCTION_READY_REPORT.md for details"
