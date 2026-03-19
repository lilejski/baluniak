'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import { calculateScheduledTime } from '@/lib/utils';

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

export async function sendFollowUpAction(leadId: string, scheduledAt: string | null = null): Promise<{ success?: boolean; error?: string }> {
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
      scheduledAt: scheduledAt || undefined,
    });

    if (emailError) {
      console.error(`Failed to send follow-up to ${lead.email}:`, emailError);
      return { error: 'Failed to send email via Resend.' };
    }

    // 4. Update database on success
    
    // 1. Dynamic Column Check
    const { data: columnInfo } = await supabaseAdmin.from('leads').select('*').limit(1).single();
    console.log("Available columns in 'leads':", Object.keys(columnInfo || {}));

    // 3. Schema Refresh Reminder
    // REMINDER: If the error persists, Reload Schema Cache in Supabase Dashboard 
    // (Settings -> API -> PostgREST -> Reload Schema Cache)
    
    let updateError;
    try {
      // 2. Robust Update Logic
      const { error } = await supabaseAdmin
        .from('leads')
        .update({ 
          step: 2, 
          status: scheduledAt ? 'scheduled' : 'sent',
          next_contact_at: scheduledAt || new Date().toISOString()
        })
        .eq('id', lead.id);
      
      updateError = error;
    } catch (e) {
      // 4. Error Handling
      console.error('FULL update error object (catch):', e);
      updateError = e;
    }

    if (updateError) {
      console.error('Error updating lead after follow-up (result):', updateError);
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

export async function sendBatchAction(templateType: string, scheduledAt: string | null = null): Promise<{ message?: string; sentCount?: number; error?: string }> {
  try {
    // 1. Query up to 5 leads where status === 'approved' and step === 1
    const { data: leads, error: fetchError } = await supabaseAdmin
      .from('leads')
      .select('*, companies(name)')
      .eq('status', 'approved')
      .eq('step', 1)
      .limit(5);

    if (fetchError) {
      console.error('Error fetching leads:', fetchError);
      return { error: 'Failed to fetch leads from database.' };
    }

    if (!leads || leads.length === 0) {
      return { message: 'No leads found to send.', sentCount: 0 };
    }

    let sentCount = 0;

    // 2. Loop through leads and send
    for (const lead of leads) {
      const companyName = lead.companies?.name || 'Twojej firmy';
      
      let subject = 'Automatyzacja ze wsparciem AI - Darmowe zdjęcia dla Polskich Restauracji';
      let html = ''; // Template logic below

      switch (templateType) {
        case 'personalized_photo':
          subject = `Wygenerowałem darmowe zdjęcie dla ${companyName}`;
          html = `<p>Cześć, pomyślałem o ${companyName} i przygotowałem darmowe zdjęcie wygenerowane przez sztuczną inteligencję. Chcecie rzucić okiem?</p>`;
          break;
        case 'follow_up':
          subject = 'Wracam do tematu';
          html = `<p>Cześć, przypominam się odnośnie fotografii AI dla ${companyName}. Udało się wam zastanowić?</p>`;
          break;
        case 'general_photo':
        default:
          subject = 'Automatyzacja ze wsparciem AI - Darmowe zdjęcia dla Polskich Restauracji';
          html = `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; color: #333333; line-height: 1.6; font-size: 15px;">
              <p>Dzień dobry,</p>
              <p>jestem z Zielonej Góry i zawodowo zajmuję się automatyzacją - tym razem w sektorze gastronomicznym.</p>
              <p>Przeglądałem profil w aplikacji dostawczej i zauważyłem, że brakuje w nim zdjęć części dań. Statystyki z portali zamawiania są w tej kwestii bezlitosne – <strong>pozycje posiadające apetyczne zdjęcie sprzedają się średnio o 30-40% lepiej</strong>. Klienci w internecie kupują głównie oczami.</p>
              <p>Doskonale rozumiem, dlaczego wiele lokali rezygnuje ze zdjęć. Profesjonalna sesja całego menu to logistyczny koszmar: trzeba ściągać fotografa, zamrażać pracę kuchni, a przygotowane do sesji jedzenie ląduje potem w koszu. <strong>To kosztuje tysiące złotych.</strong></p>
              <p>Zbudowałem aplikację AI, która pozwala rozwiązać ten problem całkowicie we własnym zakresie, niemal za darmo.</p>
              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 30px auto;">
                <tr>
                  <td width="50%" align="center" valign="top" style="padding-right: 10px;">
                    <img src="https://www.fotarobota.pl/landing/food-before.jpg" alt="Przed" style="display: block; width: 100%; max-width: 280px; height: auto; border-radius: 8px;" />
                    <p style="margin-top: 8px; font-size: 13px; color: #666666; font-style: italic;">Przed (Zdjęcie z telefonu)</p>
                  </td>
                  <td width="50%" align="center" valign="top" style="padding-left: 10px;">
                    <img src="https://www.fotarobota.pl/landing/food-after1.png" alt="Po" style="display: block; width: 100%; max-width: 280px; height: auto; border-radius: 8px;" />
                    <p style="margin-top: 8px; font-size: 13px; color: #666666; font-style: italic;">Po (FotaRobota)</p>
                  </td>
                </tr>
              </table>
              <p><strong>Jak to działa?</strong><br>
              Wasz kucharz lub kelner robi zwykłe zdjęcie wydanego dania swoim smartfonem (nawet na roboczym blacie). Wgrywacie je do mojego systemu, a sztuczna inteligencja w 30 sekund odcina tło, poprawia oświetlenie i osadza potrawę w profesjonalnej scenerii. Wygenerowanie jednego takiego zdjęcia kosztuje u mnie <strong>od 1,25 zł</strong>, a system jest dostępny 24/7.</p>
              <p>Możecie przetestować to narzędzie całkowicie za darmo na jednym ze swoich dań. Wystarczy założyć konto na naszej platformie:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.fotarobota.pl" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Przetestuj za darmo na FotaRobota.pl</a>
              </div>
              <p>Przy okazji – wdrażam też dla lokalnych restauracji interaktywne menu pod kodami QR, gadżety NFC (np. naklejki na stolik "Zbliż telefon, by ocenić nas w Google"), a także odświeżam strony www pod własne zamówienia online, by omijać gigantyczne prowizje portali.</p>
              <p>Jeśli macie pytania zapraszam do kontaktu. Jestem na miejscu w ZG.</p>
              <p>Pozdrawiam,<br><br>
              <strong>Łukasz Baluniak</strong><br>
              <span style="color: #666666; font-size: 13px;">Tech Specialist // Product Engineer</span><br>
              <span style="color: #666666; font-size: 13px;">• AI Automation & Development</span><br>
              <span style="color: #666666; font-size: 13px;">• E-commerce & Web Solutions</span><br>
              <span style="color: #666666; font-size: 13px;">• <a href="https://baluniak.com" style="color: #2563eb; text-decoration: none;">baluniak.com</a> // FotaRobota.pl Founder</span>
              </p>
            </div>
          `;
          break;
      }

      // a. Send email via Resend
      const { error: emailError } = await resend.emails.send({
        from: 'Łukasz Bałuniak | FotaRobota <lukasz@baluniak.com>',
        to: [lead.email],
        subject,
        html,
        scheduledAt: scheduledAt || undefined,
      });

      if (emailError) {
        console.error(`Failed to send email to ${lead.email}:`, emailError);
        continue;
      }

      // b. Delay and Database Updates
      if (!scheduledAt) {
        await new Promise(r => setTimeout(r, 2000));
      }

      const { error: updateError } = await supabaseAdmin
        .from('leads')
        .update({ 
          status: scheduledAt ? 'scheduled' : 'sent', 
          next_contact_at: scheduledAt || new Date().toISOString() 
        })
        .eq('id', lead.id);

      if (updateError) {
        console.error(`Error updating lead ${lead.id}:`, updateError);
      }

      sentCount++;
    }

    revalidatePath('/admin/outreach');
    return { message: 'Batch processed successfully.', sentCount };

  } catch (error) {
    console.error('Error processing batch send:', error);
    return { error: 'An unexpected error occurred.' };
  }
}
