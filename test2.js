const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2].replace(/["']/g, '').trim();
  return acc;
}, {});

fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?clerkId=eq.user_39h5es3DmAlHpMGTBZvmrfrZA33`, {
  headers: {
    'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }
}).then(r => r.json()).then(console.log).catch(console.error);
