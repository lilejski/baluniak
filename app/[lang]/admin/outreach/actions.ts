'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';

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
