import React from 'react';
import { FileCheck2, ShieldAlert } from 'lucide-react';
import { PolicyEligibility } from '../types';

interface Props {
  eligibility?: PolicyEligibility;
}

export const PolicyEligibilityCard: React.FC<Props> = ({ eligibility }) => {
  if (!eligibility) return null;

  return (
    <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            Insurance policy eligibility
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <h3 className="text-lg font-extrabold text-slate-900">{eligibility.status}</h3>
            <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
              Temporary default
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">{eligibility.message}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <FileCheck2 className={`w-4 h-4 ${eligibility.policy_document_present ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="text-slate-700">
            Policy document: <strong>{eligibility.policy_document_present ? 'uploaded' : 'not uploaded'}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span className="text-amber-800">Coverage verification: <strong>pending</strong></span>
        </div>
      </div>
    </section>
  );
};