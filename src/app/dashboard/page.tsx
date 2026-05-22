import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default async function DashboardOverview() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: user } = await supabase.from('users').select('id, instagramTokenExpiresAt').eq('clerkId', userId).maybeSingle();
  
  if (!user) {
     return <DashboardClient metrics={{ activeAutomations: 0, commentsMatched: 0, dmsSent: 0, leadsCaptured: 0, storeRevenue: 0, productsSold: 0 }} feed={[]} expiresAt={null} />;
  }

  // Pure Promise.all for high performance zero-fake DB agg sweeps
  const [automationsRes, leadsRes, eventsRes, recentLogsRes, productsRes] = await Promise.all([
    supabase.from('automations').select('id', { count: 'exact' }).eq('user_id', user.id),
    supabase.from('leads').select('id', { count: 'exact' }).eq('user_id', user.id),
    supabase.from('analytics_events').select('event_type, automation_id, metadata').eq('user_id', user.id),
    supabase.from('analytics_events').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('products').select('total_sales, total_revenue').eq('user_id', user.id)
  ]);

  let commentsMatched = 0;
  const uniqueDmFlows = new Set<string>();

  if (eventsRes.data) {
     eventsRes.data.forEach(e => {
        if (e.event_type.includes('comment')) commentsMatched++;
        if (e.event_type.includes('dm')) {
           const meta = (typeof e.metadata === 'string' ? JSON.parse(e.metadata) : e.metadata) || {};
           const recipientId = meta.recipient_id || meta.sender_id || meta.recipient_ig_id;
           const autoId = e.automation_id || meta.automation_id || 'default';
           
           if (recipientId) {
              uniqueDmFlows.add(`${autoId}_${recipientId}`);
           } else {
              uniqueDmFlows.add(`fallback_${Math.random()}_${e.event_type}`);
           }
        }
     });
  }

  const dmsSent = uniqueDmFlows.size;

  // Store revenue aggregation
  let storeRevenue = 0;
  let productsSold = 0;
  if (productsRes.data) {
    productsRes.data.forEach(p => {
      storeRevenue += Number(p.total_revenue) || 0;
      productsSold += Number(p.total_sales) || 0;
    });
  }

  const metrics = {
    activeAutomations: automationsRes.count || 0,
    commentsMatched,
    dmsSent,
    leadsCaptured: leadsRes.count || 0,
    storeRevenue,
    productsSold,
  };

  // Convert raw DB logs rigidly to the feed map without ANY synthetic intervals
  const feed = (recentLogsRes.data || []).map(evt => ({
     id: evt.id,
     text: evt.event_type === 'dm_delivered' ? `DM securely routed to user` : `System verified execution state: ${evt.event_type.replace('_', ' ')}`,
     time: new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  return <DashboardClient metrics={metrics} feed={feed} expiresAt={user.instagramTokenExpiresAt || null} />;
}
