import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const templateType = body.templateType || 'general_photo';

    // 1. Query up to 5 leads where status === 'approved' and step === 1
    const { data: leads, error: fetchError } = await supabaseAdmin
      .from('leads')
      .select('*, companies(name)')
      .eq('status', 'approved')
      .eq('step', 1)
      .limit(5);

    if (fetchError) {
      console.error('Error fetching leads:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch leads from database.' }, { status: 500 });
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({ message: 'No leads found to send.', sentCount: 0 });
    }

    let sentCount = 0;

    // 2. Loop through leads and send
    for (const lead of leads) {
      const companyName = lead.companies?.name || 'Twojej firmy';
      
      let subject = 'Propozycja współpracy';
      let html = `<p>Cześć, generuję zdjęcia jedzenia za pomocą AI. Czy chcielibyście przetestować?</p>`;

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
              
              <p>Pozdrawiam,<br>
              <br>
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
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'Łukasz Bałuniak | FotaRobota <lukasz@baluniak.com>',
        to: [lead.email],
        subject,
        html,
      });

      if (emailError) {
        console.error(`Failed to send email to ${lead.email}:`, emailError);
        continue; // skip updating this lead if email failed
      }

      // b. 2-second delay to ensure domain hygiene
      await new Promise(r => setTimeout(r, 2000));

      // c. Update lead in Supabase
      const { error: updateError } = await supabaseAdmin
        .from('leads')
        .update({ 
          status: 'sent', 
          next_contact_at: new Date().toISOString() 
        })
        .eq('id', lead.id);

      if (updateError) {
        console.error(`Error updating lead ${lead.id}:`, updateError);
        // Continue but it might have been sent
      }

      // d. Insert log into interactions
      const { error: insertError } = await supabaseAdmin
        .from('interactions')
        .insert({
          lead_id: lead.id,
          interaction_type: 'email_sent',
        });

      if (insertError) {
        console.error(`Error inserting interaction for lead ${lead.id}:`, insertError);
      }

      sentCount++;
    }

    // 3. Return JSON response
    return NextResponse.json({ 
      message: 'Batch processed successfully.', 
      sentCount 
    });

  } catch (error) {
    console.error('Error processing batch send:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
