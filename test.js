const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://krwzghlcgjmbpmcfthpn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtyd3pnaGxjZ2ptYnBtY2Z0aHBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk4OTI2MSwiZXhwIjoyMDg2NTY1MjYxfQ.xqvx_IsgKgfkxi5M28BEozPcct5piDRhVD60Lupd0RI');
async function run() {
  const { data } = await supabase.from('analytics_events').select('*').order('created_at', { ascending: false }).limit(20);
  console.log(data.map(d => ${d.created_at} |  | ).join('\n'));
}
run();
