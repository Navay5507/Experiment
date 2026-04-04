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
     return <DashboardClient metrics={{ activeAutomations: 0, commentsMatched: 0, dmsSent: 0, leadsCaptured: 0 }} feed={[]} expiresAt={null} />;
  }

  // Pure Promise.all for high performance zero-fake DB agg sweeps
  const [automationsRes, leadsRes, eventsRes, recentLogsRes] = await Promise.all([
    supabase.from('automations').select('id', { count: 'exact' }).eq('user_id', user.id),
    supabase.from('leads').select('id', { count: 'exact' }).eq('user_id', user.id),
    supabase.from('analytics_events').select('event_type').eq('user_id', user.id),
    supabase.from('analytics_events').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
  ]);

  let commentsMatched = 0;
  let dmsSent = 0;

  if (eventsRes.data) {
     eventsRes.data.forEach(e => {
        if (e.event_type.includes('comment')) commentsMatched++;
        if (e.event_type.includes('dm')) dmsSent++;
     });
  }

  const metrics = {
    activeAutomations: automationsRes.count || 0,
    commentsMatched,
    dmsSent,
    leadsCaptured: leadsRes.count || 0
  };

  // Convert raw DB logs rigidly to the feed map without ANY synthetic intervals
  const feed = (recentLogsRes.data || []).map(evt => ({
     id: evt.id,
     text: evt.event_type === 'dm_delivered' ? `DM securely routed to user` : `System verified execution state: ${evt.event_type.replace('_', ' ')}`,
     time: new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  return <DashboardClient metrics={metrics} feed={feed} expiresAt={user.instagramTokenExpiresAt || null} />;
}
