import React from 'react';
import { CheckCircle2, CircleHelp, XCircle } from 'lucide-react';
import { RequirementChecklist as RequirementChecklistData } from '../types';

interface Props {
  checklist?: RequirementChecklistData;
}

export const RequirementChecklist: React.FC<Props> = ({ checklist }) => {
  const documentItems = checklist?.items.filter(item => item.type === 'DOCUMENT') || [];

  if (!checklist || documentItems.length === 0) {
    return null;
  }

  return (
    <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            Required documentation checklist
          </p>
          <h3 className="text-lg font-extrabold text-slate-900 mt-1">
            CDT {checklist.cdt_code} payer requirements
          </h3>
        </div>
        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
          {checklist.present_required_count} of {checklist.required_count} required present
        </span>
      </div>

      <div className="mt-5 divide-y divide-slate-100">
        {documentItems.map(item => {
          const isOptional = item.status === 'OPTIONAL';
          const isPresent = item.status === 'PRESENT';
          const Icon = isOptional ? CircleHelp : isPresent ? CheckCircle2 : XCircle;
          const iconColor = isOptional ? 'text-slate-400' : isPresent ? 'text-emerald-600' : 'text-red-600';
          const statusLabel = isOptional ? 'OPTIONAL' : isPresent ? 'PRESENT' : 'REQUIRED - MISSING';
          const statusColor = isOptional ? 'text-slate-400' : isPresent ? 'text-emerald-700' : 'text-red-700';

          return (
            <div key={item.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
                <span className="text-sm font-semibold text-slate-800">{item.label}</span>
              </div>
              <span className={`text-[10px] font-bold tracking-wide whitespace-nowrap ${statusColor}`}>
                {statusLabel}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};