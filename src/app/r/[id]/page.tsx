import { supabase } from "@/lib/supabase";
import RedirectClient from "./RedirectClient";

export default async function RedirectPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { i?: string };
}) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const { id } = resolvedParams;
  const linkIndex = parseInt(resolvedSearch?.i ?? '0', 10);

  const { data: automation, error } = await supabase
    .from("automations")
    .select("dm_link, dm_links")
    .eq("id", id)
    .single();

  if (error || !automation) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100svh', background: '#FAFAFA', color: '#64748B', fontFamily: 'system-ui, sans-serif' }}>
        <h2 style={{ color: '#0F172A' }}>Link Unavailable</h2>
        <p>This automated conversation link is missing or has expired.</p>
      </div>
    );
  }

  // Prefer dm_links array (multi-link), fallback to dm_link (single)
  const links: string[] = Array.isArray(automation.dm_links) && automation.dm_links.length > 0
    ? automation.dm_links
    : automation.dm_link ? [automation.dm_link] : [];

  const targetUrl = links[linkIndex] ?? links[0];

  if (!targetUrl) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100svh', background: '#FAFAFA', color: '#64748B', fontFamily: 'system-ui, sans-serif' }}>
        <h2 style={{ color: '#0F172A' }}>Link Unavailable</h2>
        <p>This automated conversation link is missing or has expired.</p>
      </div>
    );
  }

  return <RedirectClient targetUrl={targetUrl} />;
}
