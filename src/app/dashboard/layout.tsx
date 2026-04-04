import styles from "./dashboard.module.css";
import Sidebar from "./Sidebar";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { AlertCircle } from "lucide-react";
import crypto from "crypto";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  let { data: user, error } = await supabase.from('users').select('instagramAccessToken, onboardingSkipped').eq('clerkId', clerkId).maybeSingle();

  // AUTO-SYNC: If the Clerk user doesn't exist in Supabase yet, create them now.
  // This handles the case where the Clerk webhook never fired (missing webhook secret / endpoint).
  if (!user && !error) {
    console.log(`[Dashboard Layout] Auto-syncing Clerk user to Supabase: ${clerkId}`);
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress || `${clerkId}@autodrop.co`;
    const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || null;

    const { data: newUser, error: insertError } = await supabase.from('users').insert({
      id: crypto.randomUUID(),
      clerkId: clerkId,
      email: email,
      name: name,
      plan: 'FREE',
    }).select('instagramAccessToken, onboardingSkipped').single();

    if (insertError) {
      console.error('[Dashboard Layout] Auto-sync insert failed:', insertError);
    } else {
      console.log(`[Dashboard Layout] Auto-synced user: ${clerkId} / ${email}`);
      user = newUser;
    }
  }

  // Only forcefully redirect if the column actually exists (ignoring migration faults) AND they meet the hard conditions.
  if (!error && user && !user.instagramAccessToken && !user.onboardingSkipped) {
      redirect("/onboarding");
  }

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             Dashboard Console
             {user?.instagramAccessToken ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '0.25rem 0.8rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 }}>
                   <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}/>
                   System Operational
                </div>
             ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.25rem 0.8rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 }}>
                   <AlertCircle size={14} /> Instagram Disconnected
                </div>
             )}
          </div>
          <div className={styles.userProfile}>
             <UserButton appearance={{ elements: { avatarBox: { width: 36, height: 36 } } }} />
          </div>
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
