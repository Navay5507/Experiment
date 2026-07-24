"use server";

import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

export async function submitCreatorDetails(formData: FormData) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const niche = formData.get("content_niche") as string;
  const handle = formData.get("primary_handle") as string;

  if (!niche || !handle) {
    throw new Error("Missing required fields");
  }

  // Find user by clerkId
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerkId', clerkId)
    .single();

  if (user?.id) {
    // Update the record
    await supabase
      .from('users')
      .update({
        content_niche: niche,
        primary_handle: handle
      })
      .eq('id', user.id);
  }

  return { success: true };
}
