import React, { useEffect, useState } from 'react';
import { ArrowRight, Clock, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { Claim } from '../types';
import { fetchClaims } from '../services/api';

interface AuditHistoryProps {
  onSelectClaim: (claimId: string) => void;
}

export const AuditHistory: React.FC<AuditHistoryProps> = ({ onSelectClaim }) => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaims().then(res => {
      setClaims(res);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Audit History & Timeline</h2>
        <p className="text-xs text-slate-500">Audit execution iterations, re-audits, and score progressions</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading audit history...</div>
      ) : (
        <div className="space-y-6">
          {claims.map((c) => {
            const auditResults = [...(c.audit_results || [])].sort((a, b) =>
              new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            );

            return (
              <div key={c.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-xl text-xs border border-brand-200">
                      {c.claim_number}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{c.patient_name}</h4>
                      <p className="text-xs text-slate-400 font-mono">ID: {c.patient_id}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectClaim(c.id)}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                  >
                    View Report <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {auditResults.length === 0 ? (
                    <div className="relative flex items-start gap-4 pl-8">
                      <Clock className="absolute left-0.5 top-0.5 w-6 h-6 text-slate-300 bg-white" />
                      <p className="text-xs text-slate-500">No audit has been recorded for this claim.</p>
                    </div>
                  ) : auditResults.map((audit) => {
                    const isReady = audit.status === 'READY';
                    const isReview = audit.status === 'REVIEW';
                    const Icon = isReady ? ShieldCheck : isReview ? ShieldAlert : ShieldX;
                    const iconColor = isReady ? 'text-emerald-600' : isReview ? 'text-amber-600' : 'text-red-600';
                    const summary = audit.summary || { total_checks: 0, passed: 0, warnings: 0, failed: 0 };

                    return (
                      <div key={audit.audit_id || audit.id || audit.created_at} className="relative flex items-start gap-4 pl-8">
                        <Icon className={`absolute left-0 top-0.5 w-6 h-6 ${iconColor} bg-white`} />
                        <div className={`p-3.5 rounded-2xl border text-xs space-y-2 w-full ${isReady ? 'bg-emerald-50/60 border-emerald-200' : isReview ? 'bg-amber-50/60 border-amber-200' : 'bg-red-50/60 border-red-200'}`}>
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <span className="font-bold text-slate-800">Audit executed</span>
                            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {audit.created_at ? new Date(audit.created_at).toLocaleString() : 'Unknown time'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`font-mono font-extrabold ${isReady ? 'text-emerald-700' : isReview ? 'text-amber-700' : 'text-red-700'}`}>
                              {audit.status}
                            </span>
                            <span className="text-slate-600">
                              {summary.passed} of {summary.total_checks} validation checks passed
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-[10px] text-slate-500">
                            <span>Warnings: {summary.warnings}</span>
                            <span>Failed: {summary.failed}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
