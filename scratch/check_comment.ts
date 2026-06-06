const token = 'IGAAbLz8lKLA5BZAGJreTJJdjBSN1BDX0ZArT2FGVGtac2RLTTljX2tHcUsyWkhYTVhOVEhZASGtSZAGl1MHJTb1hzOWU4dVVHWGtGUzNpRy1WaUcweW5VWUgxVURORzdpdDViTlRtbGdmRmhabFc5NW1vWEtB';
const commentId = '18395260603082120';

async function run() {
  try {
    const res = await fetch(`https://graph.instagram.com/v21.0/${commentId}?fields=id,text,timestamp,username,from&access_token=${token}`);
    const data = await res.json();
    console.log('Comment details:', JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error('Error fetching comment:', err.message);
  }
}

run();
