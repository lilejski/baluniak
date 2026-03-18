'use client';

import { useState } from 'react';
import { addLeadAction } from './actions';
import { useRouter } from 'next/navigation';

export function AddLeadForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');
    setSuccess('');
    
    const result = await addLeadAction(formData);
    
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess('Lead added successfully!');
      // reset form
      const form = document.getElementById('add-lead-form') as HTMLFormElement;
      if (form) form.reset();
      
      // Refresh the page to reflect new data
      router.refresh();
      
      setTimeout(() => setSuccess(''), 3000);
    }
    
    setLoading(false);
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8 shadow-sm">
      <h2 className="text-lg font-semibold text-white mb-4">Add New Lead</h2>
      <form id="add-lead-form" action={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="w-full sm:flex-1">
          <label htmlFor="companyName" className="block text-sm font-medium text-zinc-400 mb-1">Company Name</label>
          <input 
            type="text" 
            id="companyName" 
            name="companyName" 
            required 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Acme Corp"
          />
        </div>
        <div className="w-full sm:flex-1">
          <label htmlFor="emailAddress" className="block text-sm font-medium text-zinc-400 mb-1">Email Address</label>
          <input 
            type="email" 
            id="emailAddress" 
            name="emailAddress" 
            required 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. contact@acme.com"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none h-[38px]"
        >
          {loading ? 'Adding...' : 'Add Lead'}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {success && <p className="mt-3 text-sm text-emerald-400">{success}</p>}
    </div>
  );
}
