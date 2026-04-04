const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://krwzghlcgjmbpmcfthpn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtyd3pnaGxjZ2ptYnBtY2Z0aHBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk4OTI2MSwiZXhwIjoyMDg2NTY1MjYxfQ.xqvx_IsgKgfkxi5M28BEozPcct5piDRhVD60Lupd0RI');
async function run() {
  const { error } = await supabase.rpc('execute_sql', { query: "ALTER TABLE automations ADD COLUMN IF NOT EXISTS campaign_name text DEFAULT 'My Automation';" });
  if (error) {
    console.error('RPC execute_sql failed, trying REST API raw...', error.message);
  } else {
    console.log('Added campaign_name successfully via RPC');
  }
}
run();
