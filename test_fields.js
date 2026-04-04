const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://krwzghlcgjmbpmcfthpn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtyd3pnaGxjZ2ptYnBtY2Z0aHBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk4OTI2MSwiZXhwIjoyMDg2NTY1MjYxfQ.xqvx_IsgKgfkxi5M28BEozPcct5piDRhVD60Lupd0RI');
async function run() {
  const {data} = await supabase.from('automations').select('id, lead_capture_fields').eq('id', '33117bc5-d247-43e8-822c-01950eda5439');
  console.log(data);
  console.log('Type of fields:', typeof data[0].lead_capture_fields);
}
run();
