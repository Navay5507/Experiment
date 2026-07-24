import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import styles from "./onboarding.module.css";
import OnboardingFlow from "./OnboardingFlow";

export default async function OnboardingPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const { data: user, error } = await supabase.from('users').select('id, name, instagramAccessToken, onboardingSkipped').eq('clerkId', clerkId).maybeSingle();

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
  }

  return (
    <OnboardingFlow userName={user?.name || "there"} skipAction={skipOnboarding} />
  );
}
