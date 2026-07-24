import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import styles from "./knowledge.module.css";
import Link from "next/link";

export default async function KnowledgeBasePage() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return null;

    const { data: user, error: userError } = await supabase.from('users').select('id, plan, "knowledgeBase"').eq('clerkId', clerkId).maybeSingle();
    
    if (userError) throw userError;
    
    const isElite = user?.plan === 'ELITE';

  async function saveTrainingData(formData: FormData) {
    "use server";
    const content = formData.get("knowledgeBase") as string;
    if (!user?.id) return;
    await supabase.from('users').update({ knowledgeBase: content }).eq('id', user.id);
    revalidatePath("/dashboard/knowledge-base");
  }

  return (
    <div className={styles.container}>
       <header className={styles.header}>
         <h1 className={styles.title}>Elite AI Knowledge Base</h1>
         <p className={styles.subtitle}>Teach GPT-4o exactly how to represent your brand in DMs.</p>
       </header>

       {!isElite ? (
          <div className={styles.lockedBox}>
            <div className={styles.lockIcon}>🔒</div>
            <h2>Upgrade to Elite AI</h2>
            <p>You need the Elite tier to unlock intelligent, two-way generative AI conversations with your audience.</p>
            <Link href="/pricing" className={styles.upgradeBtn}>Unlock Elite Phase</Link>
          </div>
       ) : (
          <form action={saveTrainingData} className={styles.formCard}>
            <div className={styles.formHeader}>
               <label className={styles.label}>Global Brand Instructions</label>
            </div>
            <p className={styles.helpText}>Paste your refund policies, core product links, standard operating procedures, shipping schedules, and brand voice guidelines. The AI will strictly reference this data context when constructing dynamic replies for your customers.</p>
            
            <textarea 
              name="knowledgeBase" 
              className={styles.textarea} 
              defaultValue={user?.knowledgeBase || ""}
              placeholder="e.g. 'We offer a 30-day money back guarantee. Shipping to Canada takes 5 days... Never offer discounts on Product X.'"
              rows={18}
            />
            
            <div className={styles.submitRow}>
              <button type="submit" className={styles.saveBtn}>Compile & Deploy to AI Pipeline</button>
            </div>
          </form>
       )}
    </div>
  );
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg.includes("knowledgeBase does not exist") || errMsg.includes("does not exist")) {
      return (
        <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#fff", background: "var(--surface)", border: "1px solid #ef4444", borderRadius: "12px", maxWidth: "800px", margin: "6rem auto" }}>
           <h2 style={{ color: "#ef4444", fontSize: "1.5rem", marginBottom: "1rem" }}>Database Migration Required</h2>
           <p style={{ color: "#a1a1aa", marginBottom: "2rem", lineHeight: 1.5 }}>
             We successfully deployed the highly-advanced frontend Elite AI logic, but your active Supabase PostgreSQL database doesn't have Phase 3's new tracking columns installed yet.
           </p>
           <div style={{ background: "#000", padding: "1.5rem", borderRadius: "8px", textAlign: "left", border: "1px solid var(--border)" }}>
              <pre style={{ color: "#34d399", fontFamily: "monospace", fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>
{`ALTER TABLE users ADD COLUMN IF NOT EXISTS "knowledgeBase" TEXT;
ALTER TABLE automations ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE automations ADD COLUMN IF NOT EXISTS ai_prompt TEXT;`}
              </pre>
           </div>
           <p style={{ color: "#a1a1aa", marginTop: "2rem", fontSize: "0.95rem" }}>
             Go to your Supabase project's SQL Editor, paste this generated block, and click <strong>Run</strong> safely upgrade your live schema instantly. Then simply refresh this page!
           </p>
        </div>
      );
    }
    
    return (
      <div style={{ padding: "4rem 2rem", textAlign: "center", maxWidth: "800px", margin: "6rem auto", background: "var(--surface)", borderRadius: "12px", border: "1px solid #ef4444" }}>
        <h2 style={{ color: "#ef4444", marginBottom: "1rem" }}>System Initialization Error</h2>
        <pre style={{ color: "#a1a1aa", whiteSpace: "pre-wrap", textAlign: "left" }}>{errMsg}</pre>
      </div>
    );
  }
}
