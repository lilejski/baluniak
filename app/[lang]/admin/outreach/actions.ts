'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function addLeadAction(formData: FormData) {
  const companyName = formData.get('companyName') as string;
  const emailAddress = formData.get('emailAddress') as string;

  if (!companyName || !emailAddress) {
    return { error: 'Both Company Name and Email Address are required.' };
  }

  try {
    // 1. Insert company
    const { data: companyData, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({ name: companyName })
      .select('id')
      .single();

    if (companyError) {
      console.error('Error inserting company:', companyError);
      return { error: 'Failed to insert company. It might already exist or there was a DB error.' };
    }

    // 2. Insert lead
    const { error: leadError } = await supabaseAdmin
      .from('leads')
      .insert({
        company_id: companyData.id,
        email: emailAddress,
        status: 'draft',
      });

    if (leadError) {
      console.error('Error inserting lead:', leadError);
      if (leadError.code === '23505') {
        return { error: 'Ten email już istnieje w bazie.' };
      }
      return { error: 'Failed to insert lead.' };
    }

    // Attempt revalidation
    revalidatePath('/admin/outreach');
    revalidatePath('/', 'layout');
    
    return { success: true };
  } catch (error) {
    console.error('Exception in addLeadAction:', error);
    return { error: 'An unexpected error occurred.' };
  }
}

export async function approveLeadAction(formData: FormData): Promise<void> {
  const leadId = formData.get('leadId') as string;
  if (!leadId) return;

  try {
    const { error } = await supabaseAdmin
      .from('leads')
      .update({ status: 'approved' })
      .eq('id', leadId);

    if (error) {
      console.error('Error approving lead:', error);
    }

    revalidatePath('/admin/outreach');
  } catch (error) {
    console.error('Exception in approveLeadAction:', error);
  }
}

export async function deleteLeadAction(formData: FormData): Promise<void> {
  const leadId = formData.get('leadId') as string;
  if (!leadId) return;

  try {
    const { error } = await supabaseAdmin
      .from('leads')
      .delete()
      .eq('id', leadId);

    if (error) {
      console.error('Error deleting lead:', error);
    }

    revalidatePath('/admin/outreach');
  } catch (error) {
    console.error('Exception in deleteLeadAction:', error);
  }
}

export async function resetLeadAction(formData: FormData): Promise<void> {
  const leadId = formData.get('leadId') as string;
  if (!leadId) return;

  try {
    const { error } = await supabaseAdmin
      .from('leads')
      .update({ status: 'draft' })
      .eq('id', leadId);

    if (error) {
      console.error('Error resetting lead:', error);
    }

    revalidatePath('/admin/outreach');
  } catch (error) {
    console.error('Exception in resetLeadAction:', error);
  }
}

export async function sendFollowUpAction(leadId: string): Promise<{ success?: boolean; error?: string }> {
  if (!leadId) return { error: 'Lead ID is required' };

  try {
    // 1. Fetch lead and company data
    const { data: lead, error: fetchError } = await supabaseAdmin
      .from('leads')
      .select('*, companies(name)')
      .eq('id', leadId)
      .single();

    if (fetchError || !lead) {
      console.error('Error fetching lead:', fetchError);
      return { error: 'Failed to fetch lead data.' };
    }

    const companyName = lead.companies?.name || 'Twojej firmy';

    // 2. Prepare HTML email content
    const subject = `Re: Darmowe zdjęcia dla ${companyName} - szybkie pytanie`;
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; color: #333333; line-height: 1.6; font-size: 15px;">
        <p>Dzień dobry,</p>
        
        <p>piszę tylko krótkie przypomnienie, bo wiem, że w gastronomii każda minuta jest na wagę złota.</p>
        
        <p>W środę przesyłałem Państwu propozycję darmowego przetestowania zdjęć dań generowanych przez AI dla <strong>${companyName}</strong>. Statystyki pokazują, że dobre zdjęcia w menu to o 30-40% więcej zamówień online.</p>
        
        <p>Jeśli temat umknął w ferworze walki na kuchni, podrzucam bezpośredni link, gdzie można to sprawdzić w 30 sekund całkowicie za darmo:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://www.fotarobota.pl" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Przetestuj za darmo na FotaRobota.pl</a>
        </div>
        
        <p>Pozdrawiam i życzę udanego serwisu,<br>
        <br>
        <strong>Łukasz Bałuniak</strong><br>
        <span style="color: #666666; font-size: 13px;">Tech Specialist // Product Engineer</span><br>
        <span style="color: #666666; font-size: 13px;">• AI Automation & Development</span><br>
        <span style="color: #666666; font-size: 13px;">• E-commerce & Web Solutions</span><br>
        <span style="color: #666666; font-size: 13px;">• <a href="https://baluniak.com" style="color: #2563eb; text-decoration: none;">baluniak.com</a> // FotaRobota.pl Founder</span>
        </p>
      </div>
    `;

    // 3. Send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: 'Łukasz Bałuniak | FotaRobota <lukasz@baluniak.com>',
      to: [lead.email],
      subject,
      html,
    });

    if (emailError) {
      console.error(`Failed to send follow-up to ${lead.email}:`, emailError);
      return { error: 'Failed to send email via Resend.' };
    }

    // 4. Update database on success
    const { error: updateError } = await supabaseAdmin
      .from('leads')
      .update({
        last_contact_at: new Date().toISOString(),
        step: 2,
        status: 'sent'
      })
      .eq('id', lead.id);

    if (updateError) {
      console.error('Error updating lead after follow-up:', updateError);
      return { error: 'Email sent, but failed to update database.' };
    }

    // Attempt revalidation
    revalidatePath('/admin/outreach');
    
    return { success: true };
  } catch (error) {
    console.error('Exception in sendFollowUpAction:', error);
    return { error: 'An unexpected error occurred.' };
  }
}
