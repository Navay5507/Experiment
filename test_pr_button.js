const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://krwzghlcgjmbpmcfthpn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtyd3pnaGxjZ2ptYnBtY2Z0aHBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk4OTI2MSwiZXhwIjoyMDg2NTY1MjYxfQ.xqvx_IsgKgfkxi5M28BEozPcct5piDRhVD60Lupd0RI');
async function run() {
  const {data: users} = await supabase.from('users').select('instagramAccessToken').limit(1);
  const token = users[0].instagramAccessToken;
  
  const payload = {
    recipient: { comment_id: "18101401393760198" },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Hi there! Appreciate your comment 🙌",
          buttons: [ { type: "web_url", title: "Link", url: "https://google.com" } ]
        }
      }
    }
  };

  const res = await fetch('https://graph.instagram.com/v21.0/me/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify(payload)
  });
  console.log(await res.json());
}
run();
