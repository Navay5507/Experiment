import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import styles from "./onboarding.module.css";

export default async function OnboardingPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const { data: user, error } = await supabase.from('users').select('id, instagramAccessToken, onboardingSkipped').eq('clerkId', clerkId).maybeSingle();

  // Failsafe rendering if DB isn't migrated yet
  if (error && error.message.includes('does not exist')) {
     return <div style={{ padding: '2rem', color: '#ff6b6b' }}><h2>Database Migration Required</h2><p>Please run the Phase 5 migrations in Supabase to add the onboarding_skipped column.</p></div>;
  }

  // If they already connected or chose to skip, send them straight to the dashboard seamlessly
  if (user?.instagramAccessToken || user?.onboardingSkipped) {
     redirect("/dashboard");
  }

  async function skipOnboarding() {
    "use server";
    if (user?.id) {
       await supabase.from('users').update({ onboardingSkipped: true }).eq('id', user.id);
    }
    redirect("/dashboard");
  }

  return (
     <div className={styles.container}>
        <div className={styles.glassCard}>
           <div className={styles.iconContainer}>
              <div className={styles.igIcon}>📸</div>
           </div>
           <h1 className={styles.title}>Connect Your Instagram</h1>
           <p className={styles.subtitle}>Link your Instagram Professional account to Autodrop right now to automatically unlock Generative AI replies, Follow-Gates, and interactive Lead Captures.</p>
           
           <div className={styles.actionRow}>
              <a href="/api/auth/instagram" className={styles.connectBtn}>Connect Instagram Account</a>
              <form action={skipOnboarding}>
                 <button type="submit" className={styles.skipBtn}>Skip for now</button>
              </form>
           </div>

           <p className={styles.footerText}>You can always configure integrations later from your Settings page.</p>
        </div>
     </div>
  );
}
