/**
 * Resilient In-Memory Data Store for Claim-Shield
 * Used as fallback or seed provider when Supabase credentials are missing or unreachable.
 */

const crypto = require('crypto');

function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : `id-${Math.random().toString(36).substr(2, 9)}`;
}

// Initial Seed Data
const initialPayers = [
  {
    id: 'p-demo-delta',
    name: 'demo_delta',
    display_name: 'Demo Dental Insurance',
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'p-apex-health',
    name: 'apex_health',
    display_name: 'Apex Health Dental Plan',
    created_at: new Date('2026-01-01').toISOString()
  }
];

const initialPayerRules = [
  {
    id: 'pr-1',
    payer_id: 'p-demo-delta',
    cdt_code: 'D2740',
    requirement_type: 'PROCEDURE',
    is_required: true,
    effective_date: '2026-01-01',
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'pr-2',
    payer_id: 'p-demo-delta',
    cdt_code: 'D2740',
    requirement_type: 'TOOTH',
    is_required: true,
    effective_date: '2026-01-01',
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'pr-3',
    payer_id: 'p-demo-delta',
    cdt_code: 'D2740',
    requirement_type: 'CLINICAL_NARRATIVE',
    is_required: true,
    effective_date: '2026-01-01',
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'pr-4',
    payer_id: 'p-demo-delta',
    cdt_code: 'D2740',
    requirement_type: 'CLINICAL_JUSTIFICATION',
    is_required: true,
    effective_date: '2026-01-01',
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'pr-5',
    payer_id: 'p-demo-delta',
    cdt_code: 'D2740',
    requirement_type: 'XRAY',
    is_required: true,
    effective_date: '2026-01-01',
    created_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'pr-6',
    payer_id: 'p-demo-delta',
    cdt_code: 'D2740',
    requirement_type: 'TREATMENT_PLAN',
    is_required: false,
    effective_date: '2026-01-01',
    created_at: new Date('2026-01-01').toISOString()
  }
];

const initialClaims = [
  {
    id: 'CLM-1001',
    claim_number: 'CLM-1001',
    patient_id: 'PT-10284',
    patient_name: 'John Mathew',
    date_of_birth: '1985-04-12',
    payer_id: 'p-demo-delta',
    date_of_service: '2026-08-28',
    claim_amount: 1250,
    clinical_narrative: 'Patient presents with recurrent decay under an existing restoration on tooth #14. Tooth structure is severely compromised and requires full coverage crown restoration.',
    readiness_score: 100,
    status: 'READY',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    id: 'CLM-1002',
    claim_number: 'CLM-1002',
    patient_id: 'PT-10892',
    patient_name: 'Sarah Connor',
    date_of_birth: '1990-11-05',
    payer_id: 'p-demo-delta',
    date_of_service: '2026-09-01',
    claim_amount: 1450,
    clinical_narrative: 'Patient exhibits extensive mesial-occlusal breakdown on tooth #13 with recurrent decay.',
    readiness_score: 68,
    status: 'BLOCKED',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 3).toISOString()
  }
];

const initialProcedures = [
  {
    id: 'proc-1001',
    claim_id: 'CLM-1001',
    cdt_code: 'D2740',
    tooth_number: '14',
    amount: 1250,
    description: 'Crown - Porcelain/Ceramic Substrate',
    created_at: new Date('2026-08-28').toISOString()
  },
  {
    id: 'proc-1002',
    claim_id: 'CLM-1002',
    cdt_code: 'D2740',
    tooth_number: '14',
    amount: 1450,
    description: 'Crown - Porcelain/Ceramic Substrate',
    created_at: new Date('2026-09-01').toISOString()
  }
];

const initialDocuments = [
  {
    id: 'doc-1001-1',
    claim_id: 'CLM-1001',
    file_name: 'Clinical_Notes_Pt10284.pdf',
    document_type: 'Clinical Notes',
    storage_path: 'claim-documents/CLM-1001/Clinical_Notes_Pt10284.pdf',
    file_size: 1250000,
    mime_type: 'application/pdf',
    extracted_text: 'Clinical note for John Mathew (PT-10284). Recurrent decay noted on tooth #14 with loss of cusp support.',
    uploaded_at: new Date('2026-08-28T10:00:00Z').toISOString()
  },
  {
    id: 'doc-1001-2',
    claim_id: 'CLM-1001',
    file_name: 'Bitewing_XRay_14.jpg',
    document_type: 'X-Ray / Radiograph',
    storage_path: 'claim-documents/CLM-1001/Bitewing_XRay_14.jpg',
    file_size: 2400000,
    mime_type: 'image/jpeg',
    extracted_text: 'Pre-op radiograph taken on tooth #14 showing clear radiolucency beneath disto-occlusal margin.',
    uploaded_at: new Date('2026-08-28T10:05:00Z').toISOString()
  },
  {
    id: 'doc-1002-1',
    claim_id: 'CLM-1002',
    file_name: 'Clinical_Note_Pt10892.pdf',
    document_type: 'Clinical Notes',
    storage_path: 'claim-documents/CLM-1002/Clinical_Note_Pt10892.pdf',
    file_size: 1100000,
    mime_type: 'application/pdf',
    extracted_text: 'Clinical examination reveals severe decay on tooth #13.',
    uploaded_at: new Date('2026-09-01T09:00:00Z').toISOString()
  }
];



// Synthetic historical payer outcomes used to demonstrate the learning loop.
// These are intentionally labeled as demo data; real deployment should ingest adjudication outcomes.
const initialClaimOutcomes = [
  ...Array.from({ length: 9 }, (_, i) => ({ id: `ro-dd-just-${i}`, claim_id: `H-DD-J-${i}`, payer_id: 'p-demo-delta', cdt_code: 'D2740', outcome: 'REJECTED', rejection_reason: 'INSUFFICIENT_CLINICAL_JUSTIFICATION', rejection_text: 'Documentation did not sufficiently establish clinical necessity for the crown.', features: { payer_id: 'p-demo-delta', cdt_code: 'D2740', has_xray: true, has_clinical_note: true, has_treatment_plan: false, has_clinical_justification: false, has_tooth_mismatch: false, procedure_valid: true, narrative_tokens: ['crown','decay','restoration'] }, created_at: new Date('2026-08-01').toISOString() })),
  ...Array.from({ length: 6 }, (_, i) => ({ id: `ro-dd-xray-${i}`, claim_id: `H-DD-X-${i}`, payer_id: 'p-demo-delta', cdt_code: 'D2740', outcome: 'REJECTED', rejection_reason: 'MISSING_XRAY', rejection_text: 'Supporting radiograph was not received.', features: { payer_id: 'p-demo-delta', cdt_code: 'D2740', has_xray: false, has_clinical_note: true, has_treatment_plan: false, has_clinical_justification: true, has_tooth_mismatch: false, procedure_valid: true, narrative_tokens: ['crown','decay'] }, created_at: new Date('2026-08-02').toISOString() })),
  ...Array.from({ length: 4 }, (_, i) => ({ id: `ro-dd-mismatch-${i}`, claim_id: `H-DD-M-${i}`, payer_id: 'p-demo-delta', cdt_code: 'D2740', outcome: 'REJECTED', rejection_reason: 'DOCUMENTATION_MISMATCH', rejection_text: 'Tooth number is inconsistent across submitted documentation.', features: { payer_id: 'p-demo-delta', cdt_code: 'D2740', has_xray: true, has_clinical_note: true, has_treatment_plan: false, has_clinical_justification: true, has_tooth_mismatch: true, procedure_valid: true, narrative_tokens: ['tooth','mismatch','crown'] }, created_at: new Date('2026-08-03').toISOString() })),
  ...Array.from({ length: 6 }, (_, i) => ({ id: `ro-dd-approved-${i}`, claim_id: `H-DD-A-${i}`, payer_id: 'p-demo-delta', cdt_code: 'D2740', outcome: 'APPROVED', rejection_reason: null, rejection_text: '', features: { payer_id: 'p-demo-delta', cdt_code: 'D2740', has_xray: true, has_clinical_note: true, has_treatment_plan: false, has_clinical_justification: true, has_tooth_mismatch: false, procedure_valid: true, narrative_tokens: ['crown','decay','structural','compromise'] }, created_at: new Date('2026-08-04').toISOString() })),
  ...Array.from({ length: 7 }, (_, i) => ({ id: `ro-apex-just-${i}`, claim_id: `H-AH-J-${i}`, payer_id: 'p-apex-health', cdt_code: 'D2740', outcome: 'REJECTED', rejection_reason: 'INSUFFICIENT_CLINICAL_JUSTIFICATION', rejection_text: 'Clinical evidence did not support medical necessity.', features: { payer_id: 'p-apex-health', cdt_code: 'D2740', has_xray: true, has_clinical_note: true, has_treatment_plan: false, has_clinical_justification: false, has_tooth_mismatch: false, procedure_valid: true, narrative_tokens: ['crown','decay'] }, created_at: new Date('2026-08-05').toISOString() })),
  ...Array.from({ length: 8 }, (_, i) => ({ id: `ro-apex-plan-${i}`, claim_id: `H-AH-P-${i}`, payer_id: 'p-apex-health', cdt_code: 'D2740', outcome: 'REJECTED', rejection_reason: 'MISSING_TREATMENT_PLAN', rejection_text: 'Treatment plan documentation required.', features: { payer_id: 'p-apex-health', cdt_code: 'D2740', has_xray: true, has_clinical_note: true, has_treatment_plan: false, has_clinical_justification: true, has_tooth_mismatch: false, procedure_valid: true, narrative_tokens: ['crown','treatment'] }, created_at: new Date('2026-08-06').toISOString() })),
  ...Array.from({ length: 7 }, (_, i) => ({ id: `ro-apex-approved-${i}`, claim_id: `H-AH-A-${i}`, payer_id: 'p-apex-health', cdt_code: 'D2740', outcome: 'APPROVED', rejection_reason: null, rejection_text: '', features: { payer_id: 'p-apex-health', cdt_code: 'D2740', has_xray: true, has_clinical_note: true, has_treatment_plan: true, has_clinical_justification: true, has_tooth_mismatch: false, procedure_valid: true, narrative_tokens: ['crown','decay','structural'] }, created_at: new Date('2026-08-07').toISOString() }))
];

const initialAuditResults = [];
const initialFindings = [];

class LocalStore {
  constructor() {
    this.payers = [...initialPayers];
    this.payerRules = [...initialPayerRules];
    this.claims = [...initialClaims];
    this.procedures = [...initialProcedures];
    this.documents = [...initialDocuments];
    this.auditResults = [...initialAuditResults];
    this.findings = [...initialFindings];
    this.claimOutcomes = [...initialClaimOutcomes];

    // Seed default audit for CLM-1001
    this.seedDefaultAudits();
  }

  seedDefaultAudits() {
    const auditId = 'audit-1001-v1';
    this.auditResults.push({
      id: auditId,
      claim_id: 'CLM-1001',
      readiness_score: 100,
      status: 'READY',
      total_checks: 5,
      passed_checks: 5,
      warning_checks: 0,
      failed_checks: 0,
      checks_json: [
        { type: 'PROCEDURE', status: 'PASSED', title: 'CDT Procedure D2740 Identified', message: 'Procedure code D2740 verified.' },
        { type: 'TOOTH', status: 'PASSED', title: 'Tooth #14 Specified', message: 'Valid tooth location assigned.' },
        { type: 'CLINICAL_NARRATIVE', status: 'PASSED', title: 'Clinical Narrative Present', message: 'Detailed narrative attached.' },
        { type: 'CLINICAL_JUSTIFICATION', status: 'PASSED', title: 'Clinical Indicators Detected', message: 'Recurrent decay & structural compromise identified (Confidence: 94%).' },
        { type: 'XRAY', status: 'PASSED', title: 'Supporting Radiograph Available', message: 'Pre-op X-Ray attached and verified for Tooth #14.' }
      ],
      rejection_prediction_json: {
        model: 'Payer Pattern Learner v1 (similarity-weighted k-NN)', trained_on: 25, similar_claims_considered: 19, rejection_risk: 76,
        top_reasons: [
          { reason: 'INSUFFICIENT_CLINICAL_JUSTIFICATION', label: 'Insufficient clinical justification', probability: 59, confidence: 0.84, supporting_claims: 9, average_similarity: 0.89 },
          { reason: 'MISSING_XRAY', label: 'Missing supporting radiograph', probability: 25, confidence: 0.76, supporting_claims: 6, average_similarity: 0.70 },
          { reason: 'DOCUMENTATION_MISMATCH', label: 'Documentation / tooth mismatch', probability: 16, confidence: 0.74, supporting_claims: 4, average_similarity: 0.70 }
        ],
        primary_reason: { reason: 'INSUFFICIENT_CLINICAL_JUSTIFICATION', label: 'Insufficient clinical justification', probability: 59, confidence: 0.84, supporting_claims: 9, average_similarity: 0.89 },
        payer_id: 'p-demo-delta', cdt_code: 'D2740', feature_snapshot: { has_xray: true, has_clinical_note: true, has_treatment_plan: false, has_clinical_justification: true, has_tooth_mismatch: false }
      },
      created_at: new Date(Date.now() - 3600000).toISOString()
    });

    // Seed blocked audit for CLM-1002 (Tooth Mismatch)
    const auditId2 = 'audit-1002-v1';
    this.auditResults.push({
      id: auditId2,
      claim_id: 'CLM-1002',
      readiness_score: 68,
      status: 'BLOCKED',
      total_checks: 5,
      passed_checks: 4,
      warning_checks: 0,
      failed_checks: 1,
      checks_json: [
        { type: 'PROCEDURE', status: 'PASSED', title: 'CDT Procedure D2740 Identified', message: 'Procedure code D2740 verified.' },
        { type: 'TOOTH', status: 'PASSED', title: 'Tooth #14 Specified', message: 'Tooth #14 specified on claim.' },
        { type: 'CLINICAL_NARRATIVE', status: 'PASSED', title: 'Clinical Narrative Present', message: 'Clinical narrative present.' },
        { type: 'CLINICAL_JUSTIFICATION', status: 'PASSED', title: 'Clinical Justification Found', message: 'Decay indicators present.' },
        { type: 'CONSISTENCY', status: 'FAILED', title: 'Tooth Location Inconsistency', message: 'Claim lists Tooth #14 while clinical note references Tooth #13.' }
      ],
      rejection_prediction_json: {
        model: 'Payer Pattern Learner v1 (similarity-weighted k-NN)', trained_on: 25, similar_claims_considered: 19, rejection_risk: 76,
        top_reasons: [
          { reason: 'MISSING_XRAY', label: 'Missing supporting radiograph', probability: 39, confidence: 0.79, supporting_claims: 6, average_similarity: 0.79 },
          { reason: 'INSUFFICIENT_CLINICAL_JUSTIFICATION', label: 'Insufficient clinical justification', probability: 35, confidence: 0.76, supporting_claims: 9, average_similarity: 0.61 },
          { reason: 'DOCUMENTATION_MISMATCH', label: 'Documentation / tooth mismatch', probability: 26, confidence: 0.77, supporting_claims: 4, average_similarity: 0.78 }
        ],
        primary_reason: { reason: 'MISSING_XRAY', label: 'Missing supporting radiograph', probability: 39, confidence: 0.79, supporting_claims: 6, average_similarity: 0.79 },
        payer_id: 'p-demo-delta', cdt_code: 'D2740', feature_snapshot: { has_xray: false, has_clinical_note: true, has_treatment_plan: false, has_clinical_justification: true, has_tooth_mismatch: true }
      },
      created_at: new Date(Date.now() - 1800000).toISOString()
    });

    this.findings.push({
      id: 'f-1002-1',
      claim_id: 'CLM-1002',
      audit_result_id: auditId2,
      severity: 'HIGH',
      finding_type: 'DOCUMENTATION_MISMATCH',
      title: 'Tooth Number Mismatch Detected',
      explanation: 'The claim specifies tooth #14, while the clinical documentation references tooth #13.',
      evidence: 'Claim Tooth: #14 | Clinical Note: #13',
      confidence: 0.96,
      recommended_action: 'Verify the tooth number in the claim and clinical documentation before submission.',
      status: 'OPEN',
      created_at: new Date(Date.now() - 1800000).toISOString()
    });
  }
}

const mockStore = new LocalStore();
module.exports = { mockStore, generateId };
