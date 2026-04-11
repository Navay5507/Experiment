const { createClient } = require('@supabase/supabase-js');

// Init Supabase with Service Role Key
const supabase = createClient(
  'https://krwzghlcgjmbpmcfthpn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtyd3pnaGxjZ2ptYnBtY2Z0aHBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk4OTI2MSwiZXhwIjoyMDg2NTY1MjYxfQ.xqvx_IsgKgfkxi5M28BEozPcct5piDRhVD60Lupd0RI'
);

async function upgradeAsortna() {
  const { data, error } = await supabase
    .from('users')
    .update({ plan: 'PRO' })
    .match({ instagramHandle: 'asortna' })
    .select();

  if (error) {
    console.error("Failed to upgrade:", error);
  } else {
    console.log("Successfully upgraded user @asortna to PRO!");
    console.log(data);
  }
}

upgradeAsortna();
