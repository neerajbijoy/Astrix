import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { ClaimStatus } from '../types';

interface ReadinessScoreCardProps {
  status: ClaimStatus;
  passedChecks?: number;
  totalChecks?: number;
}

export const ReadinessScoreCard: React.FC<ReadinessScoreCardProps> = ({
  status,
  passedChecks = 5,
  totalChecks = 5
}) => {
  let badgeColor = 'bg-ready-light text-ready-text border-ready-border';
  let icon = <ShieldCheck className="w-5 h-5 text-ready-solid" />;
  let label = 'DOCUMENTATION READY';

  if (status === 'BLOCKED') {
    badgeColor = 'bg-blocked-light text-blocked-text border-blocked-border';
    icon = <ShieldX className="w-5 h-5 text-blocked-solid" />;
    label = 'SUBMISSION BLOCKED';
  } else if (status === 'REVIEW') {
    badgeColor = 'bg-review-light text-review-text border-review-border';
    icon = <ShieldAlert className="w-5 h-5 text-review-solid" />;
    label = 'HUMAN REVIEW RECOMMENDED';
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl">
      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
        Pre-submission decision
      </p>
      <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold tracking-wide mt-2 ${badgeColor}`}>
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-4">
        <p className="text-sm font-bold text-slate-800">
          {passedChecks} of {totalChecks} required items present
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Submission status is determined from explicit documentation, clinical-evidence, and consistency checks.
        </p>
      </div>
    </div>
  );
};
