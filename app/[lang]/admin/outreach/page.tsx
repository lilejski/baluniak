import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { BatchSendButton } from './BatchSendButton';
import { AddLeadForm } from './AddLeadForm';
import { FollowUpButton } from './FollowUpButton';
import { SchedulingProvider } from './SchedulingContext';
import { approveLeadAction, deleteLeadAction, resetLeadAction } from './actions';
import { Trash2, RotateCcw, CheckCircle2 } from 'lucide-react';

export default async function OutreachDashboard() {
  // Fetch leads and join company_id
  const { data: leads, error } = await supabaseAdmin
    .from('leads')
    .select('*, companies(name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', JSON.stringify(error, null, 2));
  }

  const totalLeads = leads?.length || 0;
  const draftStep1 = leads?.filter(lead => lead.status === 'draft' && lead.step === 1).length || 0;
  const sentWaitingFollowUp = leads?.filter(lead => lead.status === 'sent').length || 0;
  const step2Done = leads?.filter(lead => lead.step === 2).length || 0;

  return (
    <SchedulingProvider>
      <div className="container mx-auto p-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Outreach CRM</h1>
            <p className="text-zinc-400">Manage cold email leads and campaigns.</p>
          </div>
          
          {/* Send Batch Button */}
          <BatchSendButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col justify-center">
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider mb-1">Wszystkie rekordy</p>
            <p className="text-3xl font-bold text-white">{totalLeads}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col justify-center">
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider mb-1" title="Draft (Step 1)">Czekają na 1. maila</p>
            <p className="text-3xl font-bold text-white">{draftStep1}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col justify-center">
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider mb-1" title="Sent (Czekają na follow-up)">Czekają na follow-up</p>
            <p className="text-3xl font-bold text-white">{sentWaitingFollowUp}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col justify-center">
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider mb-1" title="Step 2 (Wysłano follow-up)">Wysłano follow-up</p>
            <p className="text-3xl font-bold text-white">{step2Done}</p>
          </div>
        </div>

        <AddLeadForm />

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-zinc-300">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-800/50 border-b border-zinc-800">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Email</th>
                  <th scope="col" className="px-6 py-4 font-medium">Company</th>
                  <th scope="col" className="px-6 py-4 font-medium">Status</th>
                  <th scope="col" className="px-6 py-4 font-medium">Step</th>
                  <th scope="col" className="px-6 py-4 font-medium">Last/Next Contact</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-red-500">
                      Error loading data. Check server logs for details.
                    </td>
                  </tr>
                ) : leads && leads.length > 0 ? (
                  leads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-100">{lead.email}</td>
                      <td className="px-6 py-4">
                        {lead.companies ? lead.companies.name : 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full 
                          ${lead.status === 'draft' ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' : ''}
                          ${lead.status === 'approved' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : ''}
                          ${lead.status === 'sent' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : ''}
                          ${!['draft', 'approved', 'sent'].includes(lead.status) ? 'bg-zinc-800 text-zinc-400' : ''}
                        `}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs font-medium border border-zinc-700">
                          {lead.step}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-500">
                        {lead.next_contact_at 
                          ? new Date(lead.next_contact_at).toLocaleDateString() 
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {lead.status === 'draft' && (
                            <form action={approveLeadAction}>
                              <input type="hidden" name="leadId" value={lead.id} />
                              <button 
                                type="submit"
                                title="Approve"
                                className="inline-flex items-center justify-center p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-colors"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            </form>
                          )}

                          {lead.status === 'sent' && (
                            <FollowUpButton leadId={lead.id} />
                          )}
                          
                          {lead.status !== 'draft' && (
                            <form action={resetLeadAction}>
                              <input type="hidden" name="leadId" value={lead.id} />
                              <button 
                                type="submit"
                                title="Reset to Draft"
                                className="inline-flex items-center justify-center p-1.5 text-amber-500 hover:bg-amber-500/10 rounded-md transition-colors"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            </form>
                          )}

                          <form action={deleteLeadAction}>
                            <input type="hidden" name="leadId" value={lead.id} />
                            <button 
                              type="submit"
                              title="Delete"
                              className="inline-flex items-center justify-center p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                      No leads found. Start adding leads to your database!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SchedulingProvider>
  );
}
