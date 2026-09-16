import React from 'react';
import { BrainCircuit, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { RejectionPrediction } from '../types';

interface Props { prediction?: RejectionPrediction | null; }

export const PayerRejectionPredictionCard: React.FC<Props> = ({ prediction }) => {
  if (!prediction || prediction.trained_on === 0) return null;

  const risk = prediction.rejection_risk;
  const riskLabel = risk >= 70 ? 'HIGH RISK' : risk >= 40 ? 'MODERATE RISK' : 'LOW RISK';
  const riskClass = risk >= 70 ? 'text-red-700 bg-red-50 border-red-200' : risk >= 40 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200';

  return (
    <section className="bg-white rounded-3xl border border-indigo-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-950 to-slate-900 p-6 text-white flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/20"><BrainCircuit className="w-5 h-5 text-indigo-300" /></div>
          <div>
            <h3 className="font-extrabold text-sm tracking-wide">PAYER REJECTION INTELLIGENCE</h3>
            <p className="text-[11px] text-slate-300 mt-1">Learned from {prediction.trained_on} historical {prediction.payer_id === 'p-demo-delta' ? 'payer' : 'payer'} outcomes</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-extrabold font-mono">{risk}%</div>
          <span className="text-[9px] font-bold tracking-wider">REJECTION RISK</span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-extrabold ${riskClass}`}>
          {risk >= 40 ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          {riskLabel}
        </div>

        {prediction.primary_reason && (
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Most likely rejection reason</p>
                <p className="text-sm font-extrabold text-slate-900 mt-1">{prediction.primary_reason.label}</p>
              </div>
              <div className="text-right"><div className="text-lg font-extrabold font-mono text-indigo-700">{prediction.primary_reason.probability}%</div><div className="text-[9px] text-slate-400">pattern score</div></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Matched {prediction.primary_reason.supporting_claims} similar rejected claims.</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-500"><TrendingUp className="w-3.5 h-3.5" /> Common rejection patterns</div>
          {prediction.top_reasons.map((r) => (
            <div key={r.reason} className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold"><span className="text-slate-700">{r.label}</span><span className="font-mono text-slate-500">{r.probability}%</span></div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.max(3, r.probability)}%` }} /></div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-between text-[10px] text-slate-400">
          <span>Model: {prediction.model}</span><span>{prediction.similar_claims_considered} similar claims considered</span>
        </div>
      </div>
    </section>
  );
};
