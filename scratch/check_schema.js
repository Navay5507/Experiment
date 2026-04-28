const { createClient } = require('@supabase/supabase-js');
const s = createClient(
  'https://krwzghlcgjmbpmcfthpn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtyd3pnaGxjZ2ptYnBtY2Z0aHBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk4OTI2MSwiZXhwIjoyMDg2NTY1MjYxfQ.xqvx_IsgKgfkxi5M28BEozPcct5piDRhVD60Lupd0RI'
);

async function run() {
  // Check if column already exists
  const { data, error } = await s
    .from('users')
    .select('subscription_expires_at')
    .limit(1);

  if (!error) {
    console.log('Column already exists! Schema is ready.');
    return;
  }

  // If column doesn't exist, we need to add it via Supabase SQL editor
  console.log('Column does not exist. Error:', error.message);
  console.log('\nPlease run this SQL in your Supabase SQL Editor:');
  console.log('ALTER TABLE users ADD COLUMN subscription_expires_at TIMESTAMPTZ;');
}
run();
