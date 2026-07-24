import SidebarWrapper from "./_SidebarWrapper";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import crypto from "crypto";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  let { data: user, error } = await supabase.from('users').select('instagramAccessToken, onboardingSkipped').eq('clerkId', clerkId).maybeSingle();

  // AUTO-SYNC: If the Clerk user doesn't exist in Supabase yet, create them now.
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

  if (!error && user && !user.instagramAccessToken && !user.onboardingSkipped) {
    redirect("/onboarding");
  }

  const isConnected = !!user?.instagramAccessToken;

  return (
    <SidebarWrapper isConnected={isConnected}>
      {children}
    </SidebarWrapper>
  );
}
