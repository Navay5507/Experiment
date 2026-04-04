const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://krwzghlcgjmbpmcfthpn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtyd3pnaGxjZ2ptYnBtY2Z0aHBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk4OTI2MSwiZXhwIjoyMDg2NTY1MjYxfQ.xqvx_IsgKgfkxi5M28BEozPcct5piDRhVD60Lupd0RI');
async function run() {
  const { data: convos } = await supabase.from('dm_conversations').select('recipient_ig_id, collected_data');
  const userMap = {};
  for(let c of convos) { if(c.collected_data?.ig_username) { userMap[c.recipient_ig_id] = c.collected_data.ig_username; } }
  
  const { data: leads } = await supabase.from('leads').select('id, instagram_username');
  for (let lead of leads) {
    if (userMap[lead.instagram_username]) {
      await supabase.from('leads').update({ instagram_username: userMap[lead.instagram_username] }).eq('id', lead.id);
      console.log('Fixed', lead.instagram_username, 'to', userMap[lead.instagram_username]);
    }
  }
}
run();
