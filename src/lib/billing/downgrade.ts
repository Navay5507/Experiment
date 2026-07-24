import { supabase } from '@/lib/supabase';

/**
 * Downgrades a user to the FREE plan and enforces the free tier limits.
 * Specifically, it deactivates all but the single most recently created automation.
 * 
 * @param internalUserId The internal Supabase user.id (not Clerk ID)
 */
export async function downgradeUserToFree(internalUserId: string) {
  try {
    console.log(`[Downgrade] Initiating downgrade for user ${internalUserId}`);

    // 1. Update user plan to FREE and get their primary IG ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .update({ plan: 'FREE' })
      .eq('id', internalUserId)
      .select('instagramUserId')
      .single();

    if (userError) {
      throw new Error(`Failed to update user plan: ${userError.message}`);
    }

    // 2. Fetch all active automations for the user, ordered by creation date descending (newest first)
    const { data: automations, error: autoError } = await supabase
      .from('automations')
      .select('id, created_at')
      .eq('user_id', internalUserId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (autoError) {
      throw new Error(`Failed to fetch active automations: ${autoError.message}`);
    }

    // 3. Enforce the limit: If more than 1 active, deactivate the older ones.
    if (automations && automations.length > 1) {
      // The first one in the array is the newest, we want to keep it.
      // We slice from index 1 to get all the older ones.
      const automationsToDeactivate = automations.slice(1).map(a => a.id);

      console.log(`[Downgrade] User has ${automations.length} active automations. Deactivating ${automationsToDeactivate.length}...`);

      const { error: updateError } = await supabase
        .from('automations')
        .update({ is_active: false })
        .in('id', automationsToDeactivate);

      if (updateError) {
        throw new Error(`Failed to deactivate excess automations: ${updateError.message}`);
      }

      console.log(`[Downgrade] Successfully deactivated automations: [${automationsToDeactivate.join(', ')}]`);
    } else {
      console.log(`[Downgrade] User only has ${automations?.length || 0} active automations. No deactivation needed.`);
    }

    // 4. Enforce Connected Accounts Limit (Free = 1)
    if (user && user.instagramUserId) {
      // Delete all connected accounts except the primary one
      const { error: accError } = await supabase
        .from('connected_accounts')
        .delete()
        .eq('user_id', internalUserId)
        .neq('instagram_user_id', user.instagramUserId);
      
      if (accError) {
        console.error(`[Downgrade] Failed to remove excess connected accounts:`, accError);
      } else {
        console.log(`[Downgrade] Cleaned up excess connected accounts for user ${internalUserId}.`);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('[Downgrade] Error:', error);
    return { success: false, error: error.message };
  }
}
