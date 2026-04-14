import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import styles from "../dashboard.module.css";
import { Download, Trash2 } from "lucide-react";
import ConfirmForm from "../ConfirmForm";

export const dynamic = 'force-dynamic';

type LeadRow = {
  id: string;
  instagram_username: string;
  lead_type: string;
  lead_value: string;
  captured_at: string;
  automations: { keywords: string | string[] }[] | null;
};

export default async function LeadsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const { data: user } = await supabase.from('users').select('id, plan').eq('clerkId', clerkId).maybeSingle();

  let leads: LeadRow[] = [];
  let error = null;

  if (user) {
    const resLeads = await supabase
        .from('leads')
        .select(`id, instagram_username, lead_type, lead_value, captured_at, automations ( id, target_type, campaign_name, keywords )`)
        .eq('user_id', user.id)
        .order('captured_at', { ascending: false })
        .limit(100);

    leads = (resLeads.data || []) as LeadRow[];
    if (resLeads.error) error = resLeads.error;
  }

  const canExport = user?.plan === 'PRO' || user?.plan === 'ELITE';

  async function deleteLead(formData: FormData) {
    "use server";
    const id = formData.get('leadId') as string;
    await supabase.from('leads').delete().eq('id', id);
    redirect('/dashboard/leads');
  }

  // Helper to parse lead_value which could be JSON or plain text
  function parseLeadValue(lead: LeadRow): Record<string, string> {
    try {
      const parsed = JSON.parse(lead.lead_value);
      if (typeof parsed === 'object' && parsed !== null) return parsed as Record<string, string>;
      return { [lead.lead_type || 'data']: lead.lead_value };
    } catch {
      return { [lead.lead_type || 'data']: lead.lead_value };
    }
  }

  return (
    <div className={styles.content}>
      <div className={styles.titleArea}>
        <div>
           <h1>CRM Leads Database</h1>
           <p>All captured lead data from your Follow-Gate and Lead Capture flows.</p>
        </div>
        <div>
           {leads && leads.length > 0 && (
             canExport ? (
                <a href="/api/leads/export" className={styles.btnAction} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', borderColor: 'var(--primary)' }}>
                   <Download size={18} /> Export CSV
                </a>
             ) : (
                <a href="/pricing" className={styles.btnAction} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <Download size={18} /> Upgrade to Export
                </a>
             )
           )}
        </div>
      </div>

      <div className={styles.tableContainer}>

        {error ? (
          <div style={{ padding: '2rem', color: '#ef4444' }}>Error: {error.message}</div>
        ) : !leads || leads.length === 0 ? (
          <div className={styles.emptyState}>
             <h3>No leads harvested yet</h3>
             <p>Create a Lead Capture automation to organically pull emails directly from Instagram DMs.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Lead Contact</th>
                <th>Harvested User Data</th>
                <th>Origin Campaign</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => {
                const data = parseLeadValue(lead);
                const auto = lead.automations as any;
                const kwRaw = auto?.keywords;
                const kw = Array.isArray(kwRaw) ? kwRaw.join(', ') : kwRaw || 'None';
                let targetType = auto?.campaign_name || 'Unnamed Campaign';

                return (
                  <tr key={lead.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '1.05rem', marginBottom: '4px' }}>
                        @{lead.instagram_username}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {new Date(lead.captured_at).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'inline-block' }}>
                        {Object.entries(data).map(([key, val]) => (
                          <div key={key} style={{ fontSize: '0.9rem', marginBottom: '3px' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{key}</span>
                            <span style={{ color: 'var(--border)', margin: '0 8px' }}>|</span>
                            <span style={{ color: '#fff', fontWeight: 500 }}>{val}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ background: 'rgba(99,102,241,0.05)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(99,102,241,0.1)', display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }}></div>
                          {targetType}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 500 }}>
                          Keyword: <span style={{ color: 'var(--primary)' }}>"{kw}"</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <ConfirmForm message="Delete this lead permanently?" action={deleteLead}>
                        <input type="hidden" name="leadId" value={lead.id} />
                        <button type="submit" className={styles.btnAction} style={{ background: 'transparent', border: '1px outset rgba(239, 68, 68, 0.4)', color: '#ef4444', padding: '0.4rem 0.6rem', display: 'inline-flex' }} title="Delete Lead">
                          <Trash2 size={16} />
                        </button>
                      </ConfirmForm>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
