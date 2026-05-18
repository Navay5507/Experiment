import { createClient } from '@supabase/supabase-js';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('Fetching recent analytics events...');
  const { data, error } = await supabase
    .from('analytics_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching events:', error);
  } else {
    data.forEach(e => {
      console.log(`[${e.created_at}] ${e.event_type} | User: ${e.user_id} | Meta:`, JSON.stringify(e.metadata));
    });
  }
}

main().catch(console.error);
