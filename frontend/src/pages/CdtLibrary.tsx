import React, { useMemo, useState } from 'react';
import { AlertTriangle, BookOpen, Building2, ChevronRight, Filter, Search, ShieldCheck, Sparkles } from 'lucide-react';

interface CdtLibraryProps {
  onStartAuditWithCode: (code: string) => void;
}

type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

interface CdtEntry {
  code: string;
  name: string;
  category: string;
  risk: RiskLevel;
  description: string;
  evidence: string[];
  denialTriggers: string[];
  payerNotes: string;
}

const entries: CdtEntry[] = [
  {
    code: 'D2740', name: 'Crown - Porcelain/Ceramic Substrate', category: 'RESTORATIVE', risk: 'HIGH',
    description: 'Full-coverage crown fabricated with a porcelain or ceramic substrate.',
    evidence: ['Pre-operative radiograph', 'Clinical narrative describing structural compromise', 'Photographs or treatment plan when available'],
    denialTriggers: ['Insufficient clinical justification', 'Missing pre-operative radiograph', 'Tooth number mismatch across documents'],
    payerNotes: 'Commercial payers commonly require radiographic evidence and clear documentation of remaining tooth structure.'
  },
  {
    code: 'D2950', name: 'Core Buildup, Including Pins', category: 'RESTORATIVE', risk: 'HIGH',
    description: 'Build-up of coronal tooth structure to support a restorative crown.',
    evidence: ['Pre-operative radiograph', 'Narrative documenting loss of tooth structure', 'Treatment plan linking buildup to crown'],
    denialTriggers: ['Buildup appears routine or unsupported', 'Crown is not documented', 'No evidence of structural loss'],
    payerNotes: 'Document why the buildup is separately necessary and how much coronal structure is missing.'
  },
  {
    code: 'D4341', name: 'Periodontal Scaling and Root Planing - Four or More Teeth', category: 'PERIODONTICS', risk: 'MEDIUM',
    description: 'Scaling and root planing for four or more teeth per quadrant.',
    evidence: ['Full periodontal charting', 'Periodontal diagnosis', 'Radiographs showing bone loss'],
    denialTriggers: ['Missing probing depths', 'Insufficient periodontal findings', 'Fewer than four qualifying teeth'],
    payerNotes: 'Payers typically compare charting, radiographs, diagnosis, and submitted quadrant information.'
  },
  {
    code: 'D3330', name: 'Endodontic Treatment - Molar', category: 'ENDODONTICS', risk: 'MEDIUM',
    description: 'Complete endodontic therapy for a molar tooth.',
    evidence: ['Diagnostic radiograph', 'Pulpal and periapical diagnosis', 'Treatment narrative'],
    denialTriggers: ['Diagnosis is absent', 'Tooth or radiograph mismatch', 'Restorability is not established'],
    payerNotes: 'Include diagnostic findings and the tooth number consistently in the claim and supporting records.'
  },
  {
    code: 'D7210', name: 'Extraction - Erupted Tooth Requiring Bone Removal', category: 'ORAL SURGERY', risk: 'MEDIUM',
    description: 'Removal of an erupted tooth requiring removal of bone and/or sectioning.',
    evidence: ['Pre-operative radiograph', 'Surgical narrative', 'Documentation of bone removal or sectioning'],
    denialTriggers: ['Simple extraction documented instead', 'No surgical complexity described', 'Missing radiograph'],
    payerNotes: 'The narrative should distinguish surgical complexity from a routine extraction.'
  },
  {
    code: 'D1110', name: 'Prophylaxis - Adult', category: 'PREVENTIVE', risk: 'LOW',
    description: 'Removal of plaque, calculus, and stains from the exposed and unexposed tooth surfaces.',
    evidence: ['Treatment note', 'Routine periodontal observations'],
    denialTriggers: ['Frequency limitation', 'Conflicting periodontal diagnosis', 'Duplicate service date'],
    payerNotes: 'Verify frequency and benefit limitations before submission.'
  },
  {
    code: 'D0120', name: 'Periodic Oral Evaluation - Established Patient', category: 'DIAGNOSTIC', risk: 'LOW',
    description: 'Periodic evaluation of an established patient to assess oral health.',
    evidence: ['Evaluation note', 'Updated medical and dental history'],
    denialTriggers: ['Frequency limitation', 'Insufficient evaluation documentation', 'Duplicate exam on same date'],
    payerNotes: 'Check plan frequency and document findings that support the evaluation.'
  },
  {
    code: 'D0150', name: 'Comprehensive Oral Evaluation - New or Established Patient', category: 'DIAGNOSTIC', risk: 'LOW',
    description: 'Comprehensive evaluation for a new patient or established patient with significant changes.',
    evidence: ['Comprehensive examination note', 'Medical and dental history', 'Diagnostic findings'],
    denialTriggers: ['Periodic exam submitted instead', 'Frequency limitation', 'Missing comprehensive findings'],
    payerNotes: 'Use when the patient is new or has significant changes in health status.'
  },
  {
    code: 'D0210', name: 'Intraoral - Complete Series of Radiographic Images', category: 'DIAGNOSTIC', risk: 'MEDIUM',
    description: 'Complete intraoral radiographic series for diagnostic evaluation.',
    evidence: ['Complete radiographic series', 'Diagnostic interpretation'],
    denialTriggers: ['Incomplete series', 'Recent duplicate full-mouth series', 'Missing interpretation'],
    payerNotes: 'Confirm replacement intervals and retain all images that support the diagnostic need.'
  },
  {
    code: 'D0274', name: 'Bitewings - Four Radiographic Images', category: 'DIAGNOSTIC', risk: 'LOW',
    description: 'Four bitewing radiographic images for detection of interproximal pathology.',
    evidence: ['Four bitewing images', 'Radiographic findings'],
    denialTriggers: ['Missing images', 'Frequency limitation', 'Duplicate radiographs'],
    payerNotes: 'Submit the complete image set and verify the payer interval.'
  },
  {
    code: 'D0140', name: 'Limited Oral Evaluation - Problem Focused', category: 'DIAGNOSTIC', risk: 'LOW',
    description: 'Problem-focused evaluation for a specific oral health complaint.',
    evidence: ['Chief complaint', 'Problem-focused clinical findings', 'Diagnostic plan'],
    denialTriggers: ['No documented complaint', 'Bundled with another evaluation', 'Missing findings'],
    payerNotes: 'Tie the evaluation directly to the documented problem and treatment decision.'
  },
  {
    code: 'D2150', name: 'Amalgam - Two Surfaces, Primary or Permanent', category: 'RESTORATIVE', risk: 'LOW',
    description: 'Two-surface amalgam restoration on a primary or permanent tooth.',
    evidence: ['Caries diagnosis', 'Treatment note', 'Tooth and surfaces restored'],
    denialTriggers: ['Surface count mismatch', 'Tooth number mismatch', 'No caries or replacement rationale'],
    payerNotes: 'Document each restored surface and whether the service treats caries or replaces a restoration.'
  },
  {
    code: 'D2331', name: 'Resin-Based Composite - Two Anterior Surfaces', category: 'RESTORATIVE', risk: 'LOW',
    description: 'Resin-based composite restoration involving two anterior tooth surfaces.',
    evidence: ['Caries or fracture findings', 'Tooth and surface documentation', 'Restoration note'],
    denialTriggers: ['Incorrect surface count', 'Posterior tooth submitted as anterior', 'Missing clinical indication'],
    payerNotes: 'Ensure the narrative supports the tooth location and number of surfaces restored.'
  },
  {
    code: 'D2392', name: 'Resin-Based Composite - Two Posterior Surfaces', category: 'RESTORATIVE', risk: 'LOW',
    description: 'Resin-based composite restoration involving two posterior tooth surfaces.',
    evidence: ['Caries or fracture findings', 'Tooth and surface documentation', 'Restoration note'],
    denialTriggers: ['Surface count mismatch', 'Tooth mismatch', 'Unsupported replacement restoration'],
    payerNotes: 'Record the exact posterior tooth and surfaces treated.'
  },
  {
    code: 'D2750', name: 'Crown - Porcelain Fused to High Noble Metal', category: 'RESTORATIVE', risk: 'HIGH',
    description: 'Full-coverage crown fabricated with porcelain fused to high noble metal.',
    evidence: ['Pre-operative radiograph', 'Structural loss narrative', 'Treatment plan'],
    denialTriggers: ['Insufficient medical necessity', 'Missing radiograph', 'No documentation of tooth structure loss'],
    payerNotes: 'Provide clear justification for full coverage and the selected crown material.'
  },
  {
    code: 'D2954', name: 'Prefabricated Post and Core in Addition to Crown', category: 'RESTORATIVE', risk: 'HIGH',
    description: 'Prefabricated post and core placed to retain a crown restoration.',
    evidence: ['Endodontic treatment evidence', 'Radiograph', 'Narrative documenting retention need'],
    denialTriggers: ['No root canal evidence', 'Post appears unnecessary', 'Crown not documented'],
    payerNotes: 'Explain why the remaining tooth structure requires post retention.'
  },
  {
    code: 'D4910', name: 'Periodontal Maintenance', category: 'PERIODONTICS', risk: 'MEDIUM',
    description: 'Periodontal maintenance following active periodontal therapy.',
    evidence: ['Periodontal history', 'Current periodontal findings', 'Maintenance treatment note'],
    denialTriggers: ['No prior active therapy', 'Prophylaxis is more appropriate', 'Frequency limitation'],
    payerNotes: 'Link maintenance to prior periodontal treatment and document current disease status.'
  },
  {
    code: 'D4342', name: 'Scaling and Root Planing - One to Three Teeth per Quadrant', category: 'PERIODONTICS', risk: 'MEDIUM',
    description: 'Scaling and root planing for one to three teeth in a quadrant.',
    evidence: ['Periodontal charting', 'Diagnosis', 'Radiographs when bone loss is present'],
    denialTriggers: ['Missing probing depths', 'Insufficient calculus or pocket findings', 'Incorrect quadrant'],
    payerNotes: 'Identify each qualifying tooth and document the periodontal findings that require treatment.'
  },
  {
    code: 'D3310', name: 'Endodontic Treatment - Anterior', category: 'ENDODONTICS', risk: 'MEDIUM',
    description: 'Complete endodontic therapy for an anterior tooth.',
    evidence: ['Diagnostic radiograph', 'Pulpal and periapical diagnosis', 'Treatment narrative'],
    denialTriggers: ['Diagnosis absent', 'Tooth mismatch', 'No evidence of restorability'],
    payerNotes: 'Keep the tooth number, diagnosis, and radiographic findings consistent across the record.'
  },
  {
    code: 'D3320', name: 'Endodontic Treatment - Premolar', category: 'ENDODONTICS', risk: 'MEDIUM',
    description: 'Complete endodontic therapy for a premolar tooth.',
    evidence: ['Diagnostic radiograph', 'Pulpal and periapical diagnosis', 'Treatment narrative'],
    denialTriggers: ['Diagnosis absent', 'Tooth mismatch', 'Missing treatment indication'],
    payerNotes: 'Document the diagnosis and number of canals or relevant anatomy when material.'
  },
  {
    code: 'D3220', name: 'Therapeutic Pulpotomy', category: 'ENDODONTICS', risk: 'MEDIUM',
    description: 'Removal of the coronal pulp tissue to preserve the remaining radicular pulp.',
    evidence: ['Pulpal diagnosis', 'Clinical treatment note', 'Radiograph when indicated'],
    denialTriggers: ['Definitive endodontic treatment billed instead', 'No diagnosis', 'Treatment not clinically supported'],
    payerNotes: 'Document the therapeutic indication and whether the service is part of definitive treatment.'
  },
  {
    code: 'D7140', name: 'Extraction - Erupted Tooth or Exposed Root', category: 'ORAL SURGERY', risk: 'LOW',
    description: 'Removal of an erupted tooth or exposed root using routine extraction technique.',
    evidence: ['Extraction note', 'Tooth and diagnosis', 'Radiograph when clinically indicated'],
    denialTriggers: ['Surgical extraction characteristics documented', 'Tooth mismatch', 'Missing diagnosis'],
    payerNotes: 'Use a surgical extraction code when bone removal or sectioning is actually performed.'
  },
  {
    code: 'D7240', name: 'Removal of Impacted Tooth - Completely Bony', category: 'ORAL SURGERY', risk: 'HIGH',
    description: 'Removal of an impacted tooth completely encased in bone.',
    evidence: ['Pre-operative radiograph', 'Impaction classification', 'Surgical note'],
    denialTriggers: ['Impaction level unsupported', 'Missing radiograph', 'Routine extraction documented'],
    payerNotes: 'Radiographic evidence should clearly support the degree of impaction and surgical complexity.'
  },
  {
    code: 'D6010', name: 'Surgical Placement of Implant Body', category: 'IMPLANTOLOGY', risk: 'HIGH',
    description: 'Surgical placement of an endosteal implant body.',
    evidence: ['Diagnostic imaging', 'Implant treatment plan', 'Surgical placement note'],
    denialTriggers: ['Missing treatment plan', 'Insufficient bone or site documentation', 'Implant not covered by plan'],
    payerNotes: 'Verify benefit eligibility and document site, imaging, and the restorative treatment plan.'
  },
  {
    code: 'D6058', name: 'Abutment Supported Porcelain/Ceramic Crown', category: 'IMPLANTOLOGY', risk: 'HIGH',
    description: 'Porcelain or ceramic crown supported by an implant abutment.',
    evidence: ['Implant placement history', 'Restorative treatment plan', 'Clinical and radiographic findings'],
    denialTriggers: ['Implant history absent', 'Crown type mismatch', 'Missing restorative plan'],
    payerNotes: 'Submit the implant history and clearly distinguish the abutment-supported restoration.'
  },
  {
    code: 'D4346', name: 'Scaling in Presence of Generalized Gingival Inflammation', category: 'PERIODONTICS', risk: 'MEDIUM',
    description: 'Scaling for generalized moderate or severe gingival inflammation without periodontitis.',
    evidence: ['Gingival findings', 'Periodontal screening', 'Treatment note'],
    denialTriggers: ['Periodontitis documented instead', 'Localized inflammation only', 'Missing clinical findings'],
    payerNotes: 'Document generalized inflammation and distinguish this service from prophylaxis or SRP.'
  }
];

const categories = ['ALL', 'RESTORATIVE', 'PERIODONTICS', 'ORAL SURGERY', 'ENDODONTICS', 'IMPLANTOLOGY', 'DIAGNOSTIC', 'PREVENTIVE'];

const riskClass: Record<RiskLevel, string> = {
  HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200'
};

export const CdtLibrary: React.FC<CdtLibraryProps> = ({ onStartAuditWithCode }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('ALL');
  const [risk, setRisk] = useState('ALL');
  const [expanded, setExpanded] = useState('D2740');

  const filteredEntries = useMemo(() => entries.filter(entry => {
    const searchable = `${entry.code} ${entry.name} ${entry.description} ${entry.category}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) &&
      (category === 'ALL' || entry.category === category) &&
      (risk === 'ALL' || entry.risk === risk);
  }), [category, query, risk]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-brand-300 text-xs font-bold uppercase tracking-wider"><BookOpen className="w-4 h-4" /> CDT Clinical Guidelines</div>
            <h1 className="text-3xl font-black tracking-tight">Procedure Codes & Denial Shield</h1>
            <p className="text-xs text-slate-300 leading-relaxed">Review evidence requirements, common payer denial triggers, and submission guidance before starting a claim audit.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10"><div className="text-[10px] uppercase text-slate-300 font-bold">Indexed Codes</div><div className="text-2xl font-black font-mono mt-1">{entries.length}</div></div>
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10"><div className="text-[10px] uppercase text-slate-300 font-bold">High Risk</div><div className="text-2xl font-black font-mono text-rose-300 mt-1">{entries.filter(entry => entry.risk === 'HIGH').length}</div></div>
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search CDT code, procedure, or specialty..." className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(value => <button key={value} onClick={() => setRisk(value)} className={`px-3 py-2 rounded-xl text-xs font-bold ${risk === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>{value === 'ALL' ? 'All Risks' : `${value} Risk`}</button>)}
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1"><Filter className="w-3.5 h-3.5 text-slate-400" />{categories.map(value => <button key={value} onClick={() => setCategory(value)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap ${category === value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>{value === 'ALL' ? 'All Specialties' : value}</button>)}</div>
      </section>

      <div className="space-y-5">
        {filteredEntries.map(entry => {
          const isExpanded = expanded === entry.code;
          return <section key={entry.code} className={`bg-white rounded-3xl border overflow-hidden ${isExpanded ? 'border-brand-400 ring-2 ring-brand-100' : 'border-slate-200'}`}>
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60" onClick={() => setExpanded(isExpanded ? '' : entry.code)}>
              <div className="flex items-start gap-4"><span className="px-3 py-2 rounded-2xl bg-slate-900 text-white font-mono font-black text-sm">{entry.code}</span><div><div className="flex items-center gap-2 flex-wrap"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{entry.category}</span><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskClass[entry.risk]}`}>{entry.risk} DENIAL RISK</span></div><h2 className="font-extrabold text-base text-slate-900 mt-1">{entry.name}</h2><p className="text-xs text-slate-500 mt-1">{entry.description}</p></div></div>
              <div className="flex items-center gap-3 self-end md:self-center"><button onClick={event => { event.stopPropagation(); onStartAuditWithCode(entry.code); }} className="px-4 py-2 rounded-2xl bg-brand-50 hover:bg-brand-600 hover:text-white text-brand-700 text-xs font-bold border border-brand-200">Audit This Code</button><ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90 text-brand-600' : ''}`} /></div>
            </div>
            {isExpanded && <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/40 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3"><div className="flex items-center gap-2 text-xs font-bold"><ShieldCheck className="w-4 h-4 text-emerald-600" />Mandatory Evidence</div>{entry.evidence.map(item => <div key={item} className="text-[11px] text-slate-700 p-2.5 rounded-xl bg-slate-50 border border-slate-200">{item}</div>)}</div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3"><div className="flex items-center gap-2 text-xs font-bold text-rose-700"><AlertTriangle className="w-4 h-4 text-rose-500" />Denial Triggers</div>{entry.denialTriggers.map(item => <div key={item} className="text-[11px] text-rose-800 p-2.5 rounded-xl bg-rose-50 border border-rose-200">{item}</div>)}</div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3"><div className="flex items-center gap-2 text-xs font-bold"><Building2 className="w-4 h-4 text-brand-600" />Payer Guidance</div><p className="text-[11px] text-slate-600 leading-relaxed">{entry.payerNotes}</p><div className="flex items-center gap-2 text-[10px] text-emerald-700 font-bold"><Sparkles className="w-3.5 h-3.5" />Use this guidance before submission</div></div>
            </div>}
          </section>;
        })}
        {filteredEntries.length === 0 && <div className="bg-white rounded-3xl p-12 text-center border border-slate-200"><Search className="w-6 h-6 text-slate-400 mx-auto mb-3" /><h2 className="font-bold text-slate-900">No CDT codes found</h2><p className="text-xs text-slate-500 mt-1">Try a broader search or reset the filters.</p></div>}
      </div>
    </div>
  );
};