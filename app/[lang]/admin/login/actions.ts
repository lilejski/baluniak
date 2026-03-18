'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  // 1. Check honeypot
  const honeypot = formData.get('contact_phone') as string;
  if (honeypot) {
    // Silently drop bots by pretending it failed identically
    return { error: 'Invalid username or password' };
  }

  // 2. Extract credentials
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const currentLang = formData.get('currentLang') as string || 'pl';

  // 3. Verify credentials against ENV (always check ENV presence to prevent accidental bypasses)
  const envUser = process.env.ADMIN_USER;
  const envPass = process.env.ADMIN_PASS;

  if (!envUser || !envPass) {
    console.error('CRITICAL: ADMIN_USER or ADMIN_PASS not set in environment.');
    return { error: 'Authentication currently unavailable.' };
  }

  if (username !== envUser || password !== envPass) {
    // Add artificial delay to deter brute-force
    await new Promise(r => setTimeout(r, 1000));
    return { error: 'Invalid username or password' };
  }

  // 4. Set HttpOnly secure cookie
  const cookieStore = await cookies();
  cookieStore.set('crm_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  // 5. Redirect on success
  redirect(`/${currentLang}/admin/outreach`);
}
