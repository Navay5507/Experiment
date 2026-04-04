const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  const { data, error } = await supabase.from('users').select('*');
  console.log('Result:', JSON.stringify(data, null, 2));
  console.log('Error:', error);
}

testFetch();
