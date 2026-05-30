import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import styles from "../dashboard.module.css";
import { Activity, Zap } from "lucide-react";
import ConfirmForm from "../ConfirmForm";
import CommentQueuePanel from "./CommentQueuePanel";

export const dynamic = 'force-dynamic';

export default async function LogsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const { data: user } = await supabase.from('users').select('id').eq('clerkId', clerkId).maybeSingle();

  let events: { id: string; event_type: string; created_at: string; metadata?: { recipient_id?: string; comment_id?: string; success?: boolean; error?: string } }[] = [];
  let error = null;

  if (user) {
    const res = await supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    events = res.data || [];
    error = res.error;
  }

  return (
    <div className={styles.content}>
      <div className={styles.titleArea}>
        <div>
           <h1>Application Trace Logs</h1>
           <p>Chronological background worker events verifying outbound API states.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
           <ConfirmForm message="Clear all pending automation jobs from the queue?" action={async () => { "use server"; const { userId } = await auth(); if (!userId) return; const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'; await fetch(`${appUrl}/api/queue/clear`, { method: 'POST', headers: { 'Content-Type': 'application/json' } }); redirect('/dashboard/logs'); }}>
             <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, border: '1px solid rgba(245,158,11,0.3)', cursor: 'pointer' }}>
               <Zap size={16} /> Clear Queue
             </button>
           </ConfirmForm>
           <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
             <Activity size={16} /> Live Streaming
           </span>
        </div>
      </div>

      <CommentQueuePanel />

      <div className={styles.tableContainer}>
        {error ? (
          <div style={{ padding: '2rem', color: '#ef4444' }}>Terminal Error: {error.message}</div>
        ) : !events || events.length === 0 ? (
          <div className={styles.emptyState}>
             <h3>Worker pipeline is empty</h3>
             <p>As soon as Meta hits our webhooks, tracking details will trace here instantly.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Event Origin</th>
                <th>Target Node</th>
                <th>Success Payload</th>
              </tr>
            </thead>
            <tbody>
              {events.map((evt) => (
                <tr key={evt.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    {evt.created_at ? new Date(evt.created_at).toLocaleString() : '—'}
                  </td>
                  <td>
                    <span style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
                      {evt.event_type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>
                     {evt.metadata?.recipient_id ? `User: ${String(evt.metadata.recipient_id).slice(0,12)}…` : evt.metadata?.comment_id ? `Comment` : 'System'}
                  </td>
                  <td>
                    {evt.metadata?.success === false ? (
                      <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
                         API Fault: {evt.metadata?.error || "Unknown Edge Constraint"}
                      </span>
                    ) : (
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 5px #10b981' }} />
                          OK: Processed internally
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
