import { supabase } from "@/lib/supabase";
import RedirectClient from "./RedirectClient";

export default async function RedirectPage({ params }: { params: { id: string } }) {
  // Await params because Next.js 14+ expects params to be a Promise in some app router configs
  // Though technically synchronicity has changed, awaiting is safer.
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const { data: automation, error } = await supabase
    .from("automations")
    .select("dm_link")
    .eq("id", id)
    .single();

  if (error || !automation || !automation.dm_link) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100svh', background: '#FAFAFA', color: '#64748B', fontFamily: 'system-ui, sans-serif' }}>
        <h2 style={{ color: '#0F172A' }}>Link Unavailable</h2>
        <p>This automated conversation link is missing or has expired.</p>
      </div>
    );
  }

  return <RedirectClient targetUrl={automation.dm_link} />;
}
