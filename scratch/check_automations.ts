import { supabase } from '../src/lib/supabase';

async function checkAutomations() {
  const { data } = await supabase.from('automations').select('id, name, reply_template, is_active').eq('is_active', true);
  console.log(data);
  process.exit(0);
}

checkAutomations();
