import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse('Unauthorized', { status: 401 });

    const { data: user, error: userError } = await supabase.from('users').select('id, plan').eq('clerkId', clerkId).maybeSingle();
    
    if (userError) {
      console.error("Export Error:", userError);
      return new NextResponse('Database Error', { status: 500 });
    }

    // Phase 4: Pro/Elite specific CSV export gating
    if (user?.plan === 'FREE') {
      return new NextResponse('Upgrade to Pro to export leads to CSV', { status: 403 });
    }

    const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user?.id)
        .order('captured_at', { ascending: false });

    if (leadsError || !leads || leads.length === 0) {
        return new NextResponse('No leads available to export.', { status: 404 });
    }

    // Construct CSV String
    const csvRows = ['Captured At,Instagram Handle,Lead Type,Lead Data'];
    
    for (const lead of leads) {
      const date = new Date(lead.captured_at).toISOString();
      const type = lead.lead_type || 'email';

      // lead_value may be JSON or plain text
      let displayValue = lead.lead_value || '';
      try {
        const parsed = JSON.parse(displayValue);
        if (typeof parsed === 'object' && parsed !== null) {
          displayValue = Object.entries(parsed).map(([k, v]) => `${k}: ${v}`).join(' | ');
        }
      } catch {
        // Already a plain string, use as-is
      }

      const val = `"${displayValue.replace(/"/g, '""')}"`; // Escape quotes
      csvRows.push(`${date},${lead.instagram_username},${type},${val}`);
    }

    const csvData = csvRows.join('\n');

    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="autodrop_leads_export.csv"',
      }
    });

  } catch (error: unknown) {
    console.error('Leads CSV Export Crash:', error);
    return new NextResponse('Internal Server Error generating CSV', { status: 500 });
  }
}
