
const token1 = 'IGAAbLz8lKLA5BZAGJreTJJdjBSN1BDX0ZArT2FGVGtac2RLTTljX2tHcUsyWkhYTVhOVEhZASGtSZAGl1MHJTb1hzOWU4dVVHWGtGUzNpRy1WaUcweW5VWUgxVURORzdpdDViTlRtbGdmRmhabFc5NW1vWEtB';
const token2 = 'IGAAbLz8lKLA5BZAGJGM05uaVZAMZA3hyU1lvRW40WDdPVnhjNWx2R1B1SHNtRHJyVG1wcTVGVkx4b0RVS0ZAYX3hta2tmczZALVHVwNDRZAWTJBby1IWlVGQzhtQTY2OHpwVVdTX2pnX2Vxd3BGRmFXNGk5SEdR';

async function test(name: string, token: string) {
  console.log(`\nTesting token for ${name}...`);
  try {
    const res = await fetch(`https://graph.instagram.com/v21.0/me?fields=user_id,id,username&access_token=${token}`);
    const data = await res.json();
    console.log(`Result for ${name}:`, JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error(`Error for ${name}:`, err.message);
  }
}

async function run() {
  await test('autodrop.in (token1)', token1);
  await test('asortna (token2)', token2);
}

run();
