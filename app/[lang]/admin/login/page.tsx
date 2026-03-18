'use client';

import { useState } from 'react';
import { loginAction } from './actions';
import { useParams } from 'next/navigation';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const lang = params?.lang as string || 'pl';

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');
    
    // Append current lang for redirect inside Server Action
    formData.append('currentLang', lang);

    const result = await loginAction(formData);
    
    // loginAction will redirect on success. 
    // If it returns a result, it means it's an error.
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-zinc-900 border border-zinc-800 p-10 rounded-2xl shadow-xl relative z-10">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white tracking-tight">
            Admin Area
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-400">
            Sign in to access the outreach CRM
          </p>
        </div>
        <form className="mt-8 space-y-6" action={handleSubmit}>
          
          {/* Honeypot field - Invisible to humans, tempting for bots */}
          <div className="hidden" aria-hidden="true">
            <input 
              type="text" 
              name="contact_phone" 
              tabIndex={-1} 
              autoComplete="off" 
            />
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-zinc-300">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-zinc-700 bg-zinc-950 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors sm:text-sm"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-zinc-700 bg-zinc-950 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors sm:text-sm"
                  placeholder="Enter password"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-wait focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-zinc-900 transition-colors shadow-sm"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
