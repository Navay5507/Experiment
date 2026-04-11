const { createClient } = require('@supabase/supabase-js');

// Init Supabase with Service Role Key (bypasses RLS)
const supabase = createClient(
  'https://krwzghlcgjmbpmcfthpn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtyd3pnaGxjZ2ptYnBtY2Z0aHBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk4OTI2MSwiZXhwIjoyMDg2NTY1MjYxfQ.xqvx_IsgKgfkxi5M28BEozPcct5piDRhVD60Lupd0RI'
);

async function checkAndUpgrade() {
  // Get all users
  const { data: users, error } = await supabase.from('users').select('id, instagramHandle, clerkId, plan');
  
  if (error) {
    console.error("Error fetching users:", error);
    return;
  }

  console.log("--- Current Users ---");
  for (const u of users) {
    console.log(`Handle: ${u.instagramHandle || 'None'} | ID: ${u.id} | Plan: ${u.plan}`);
  }
}

checkAndUpgrade();
