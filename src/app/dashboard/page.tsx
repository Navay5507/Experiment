import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default async function DashboardOverview() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: user } = await supabase.from('users').select('id, instagramTokenExpiresAt, instagramAccessToken').eq('clerkId', userId).maybeSingle();
  
  if (!user) {
     return <DashboardClient metrics={{ activeAutomations: 0, cyclesCompleted: 0, cyclesInProgress: 0, commentsMatched: 0, leadsCaptured: 0, hasConnectedIG: false, totalAutomations: 0, totalProducts: 0, activeProducts: 0, followGateConversions: 0, linkClicks: 0, conversionRate: 0 }} feed={[]} expiresAt={null} />;
  }

  // Pure Promise.all for high performance zero-fake DB agg sweeps
  const [automationsRes, leadsRes, conversationsRes, recentLogsRes, productsRes, commentsMatchedRes, followGateRes, dmDeliveredRes, linkClicksRes] = await Promise.all([
    supabase.from('automations').select('id, is_active').eq('user_id', user.id),
    supabase.from('leads').select('id', { count: 'exact' }).eq('user_id', user.id),
    supabase.from('dm_conversations').select('state').eq('user_id', user.id),
    supabase.from('analytics_events').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('products').select('total_sales, total_revenue, is_active').eq('user_id', user.id),
    supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('event_type', 'comment_matched'),
    supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('event_type', 'dm_delivered').filter('metadata->>type', 'eq', 'link_after_follow'),
    supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('event_type', 'dm_delivered'),
    supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('event_type', 'link_click')
  ]);

  let cyclesCompleted = conversationsRes.data?.length || 0;
  let cyclesInProgress = 0;

  if (conversationsRes.data) {
     conversationsRes.data.forEach(c => {
        if (c.state !== 'completed') {
           cyclesInProgress++;
        }
     });
  }

  const totalAutomations = automationsRes.data?.length || 0;
  const activeAutomations = automationsRes.data?.filter(a => a.is_active).length || 0;
  const totalProducts = productsRes.data?.length || 0;
  const activeProducts = productsRes.data?.filter(p => p.is_active).length || 0;

  const commentsMatched = commentsMatchedRes.count || 0;
  const leadsCaptured = leadsRes.count || 0;
  const conversionRate = commentsMatched > 0 ? parseFloat(((leadsCaptured / commentsMatched) * 100).toFixed(1)) : 0;

  const metrics = {
    activeAutomations,
    cyclesCompleted,
    cyclesInProgress,
    commentsMatched,
    leadsCaptured,
    hasConnectedIG: !!user.instagramAccessToken,
    totalAutomations,
    totalProducts,
    activeProducts,
    followGateConversions: followGateRes.count || 0,
    linkClicks: linkClicksRes.count || 0,
    conversionRate,
  };

  // Convert raw DB logs rigidly to the feed map without ANY synthetic intervals
  const feed = (recentLogsRes.data || []).map(evt => ({
     id: evt.id,
     text: evt.event_type === 'dm_delivered' ? `DM securely routed to user` : `System verified execution state: ${evt.event_type.replace('_', ' ')}`,
     time: new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  return <DashboardClient metrics={metrics} feed={feed} expiresAt={user.instagramTokenExpiresAt || null} />;
}

