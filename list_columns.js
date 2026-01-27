require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function listColumns() {
    const { data, error } = await supabase.rpc('get_table_columns', { table_name_input: 'ranges' })

    if (error) {
        // If RPC doesn't exist, try a direct query to information_schema if possible, 
        // but usually we can't do that via supabase-js easily without another RPC.
        // Let's try to just fetch one row and see the keys.
        console.log('Trying to fetch one row to see keys...')
        const { data: row, error: rowError } = await supabase.from('ranges').select('*').limit(1).single()
        if (rowError) {
            console.error('Error fetching row:', rowError)
        } else {
            console.log('Columns in ranges table:', Object.keys(row))
        }
    } else {
        console.log('Columns:', data)
    }
}

listColumns()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Script failed:', err)
        process.exit(1)
    })
