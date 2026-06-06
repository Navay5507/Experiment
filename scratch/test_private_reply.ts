const token = 'IGAAbLz8lKLA5BZAGJreTJJdjBSN1BDX0ZArT2FGVGtac2RLTTljX2tHcUsyWkhYTVhOVEhZASGtSZAGl1MHJTb1hzOWU4dVVHWGtGUzNpRy1WaUcweW5VWUgxVURORzdpdDViTlRtbGdmRmhabFc5NW1vWEtB';
const commentId = '18395260603082120';
const messageText = 'Test Private Reply from script';

async function run() {
  const payload = {
    recipient: { comment_id: commentId },
    message: { text: messageText },
  };

  try {
    const res = await fetch(`https://graph.instagram.com/v21.0/me/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    console.log('Private Reply response:', JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

run();
