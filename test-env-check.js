// Test script to check which environment variables are available
console.log('=== Environment Variables Check ===')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING')

console.log('\n=== All Environment Variables ===')
const allEnvVars = Object.keys(process.env).filter(key =>
  key.includes('SUPABASE') || key.includes('SERVICE') || key.includes('ARCHERY')
)
console.log('Supabase-related vars:', allEnvVars)

console.log('\n=== Vercel Environment ===')
console.log('VERCEL:', process.env.VERCEL)
console.log('VERCEL_ENV:', process.env.VERCEL_ENV)
console.log('NODE_ENV:', process.env.NODE_ENV)
