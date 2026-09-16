const { createClient } = require('@supabase/supabase-js');
const { mockStore, generateId } = require('../services/mockStore');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

let supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (supabaseUrl && !supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  supabaseUrl = `https://${supabaseUrl}`;
}

let supabase = null;
let isConfigured = false;

function normalizeAuditResult(audit) {
  return {
    ...audit,
    audit_id: audit.audit_id || audit.id,
    summary: audit.summary || {
      total_checks: audit.total_checks || 0,
      passed: audit.passed_checks || 0,
      warnings: audit.warning_checks || 0,
      failed: audit.failed_checks || 0
    },
    checks: audit.checks || audit.checks_json || [],
    findings: audit.findings || [],
    requirement_checklist: audit.requirement_checklist || audit.requirement_checklist_json || null,
    policy_eligibility: audit.policy_eligibility || audit.policy_eligibility_json || null,
    rejection_prediction: audit.rejection_prediction || audit.rejection_prediction_json || null
  };
}

if (
  supabaseUrl &&
  supabaseServiceKey &&
  !supabaseUrl.includes('your-supabase-project') &&
  !supabaseServiceKey.includes('your-supabase-service-role-key')
) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    isConfigured = true;
    console.log('[Supabase] Client initialized successfully with Service Role key.');
  } catch (err) {
    console.warn('[Supabase] Initialization failed, falling back to local database store:', err.message);
  }
} else {
  throw new Error('[Supabase] Supabase credentials are missing or invalid. Mock storage is disabled for real-data testing.');
}

// Unified Database Access Interface
const db = {
  isSupabaseConfigured: () => isConfigured,

  // Payers
  getPayers: async () => {
    if (isConfigured) {
      const { data, error } = await supabase.from('payers').select('*').order('created_at', { ascending: true });
      if (!error && data && data.length > 0) return data;
    }
    return mockStore.payers;
  },

  getPayerRules: async (payerId) => {
    if (isConfigured) {
      const { data, error } = await supabase.from('payer_rules').select('*').eq('payer_id', payerId);
      if (!error && data && data.length > 0) return data;
    }
    return mockStore.payerRules.filter(r => r.payer_id === payerId || payerId === 'p-demo-delta');
  },

  // Claims
  getClaims: async (filters = {}) => {
    if (isConfigured) {
      let query = supabase.from('claims').select('*, procedures(*), documents(*), audit_results(*)').order('created_at', { ascending: false });
      if (filters.owner_id) query = query.eq('owner_id', filters.owner_id);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.payer_id) query = query.eq('payer_id', filters.payer_id);
      const { data, error } = await query;
      if (!error && data) return data.map(c => {
        const audits = (c.audit_results || []).map(normalizeAuditResult);
        return { ...c, audit_results: audits, latest_audit: audits.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0] || null };
      });
    }

    let claims = [...mockStore.claims];
    if (filters.owner_id) claims = claims.filter(c => c.owner_id === filters.owner_id);
    if (filters.status) {
      claims = claims.filter(c => c.status === filters.status);
    }
    if (filters.payer_id) {
      claims = claims.filter(c => c.payer_id === filters.payer_id);
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      claims = claims.filter(c => 
        c.claim_number.toLowerCase().includes(s) || 
        c.patient_name.toLowerCase().includes(s) ||
        c.patient_id.toLowerCase().includes(s)
      );
    }
    return claims.map(claim => ({
      ...claim,
      procedures: mockStore.procedures.filter(p => p.claim_id === claim.id),
      documents: mockStore.documents.filter(d => d.claim_id === claim.id),
      latest_audit: (() => { const a = mockStore.auditResults.filter(a => a.claim_id === claim.id).sort((x,y) => new Date(y.created_at)-new Date(x.created_at))[0]; return a ? { ...a, rejection_prediction: a.rejection_prediction_json || a.rejection_prediction || null } : null; })()
    }));
  },

  getClaimById: async (id, ownerId) => {
    if (isConfigured) {
      const { data, error } = await supabase
        .from('claims')
        .select('*, procedures(*), documents(*), audit_results(*), findings(*)')
        .eq('id', id)
        .eq('owner_id', ownerId)
        .single();
      if (!error && data) {
        const audits = (data.audit_results || []).map(normalizeAuditResult);
        return { ...data, audit_results: audits, latest_audit: audits.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0] || null };
      }
    }

    const claim = mockStore.claims.find(c => (c.id === id || c.claim_number === id) && (!ownerId || c.owner_id === ownerId));
    if (!claim) return null;

    const procedures = mockStore.procedures.filter(p => p.claim_id === claim.id);
    const documents = mockStore.documents.filter(d => d.claim_id === claim.id);
    const audit_results = mockStore.auditResults.filter(a => a.claim_id === claim.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(a => ({ ...a, rejection_prediction: a.rejection_prediction_json || a.rejection_prediction || null }));
    const findings = mockStore.findings.filter(f => f.claim_id === claim.id);

    return {
      ...claim,
      procedures,
      documents,
      audit_results,
      latest_audit: audit_results[0] || null,
      findings
    };
  },

  createClaim: async (claimData, procedureData, ownerId) => {
    const claimId = claimData.claim_number || `CLM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newClaim = {
      id: claimId,
      claim_number: claimId,
      patient_id: claimData.patient_id || `PT-${Math.floor(10000 + Math.random() * 90000)}`,
      patient_name: claimData.patient_name || 'Anonymous Patient',
      date_of_birth: claimData.date_of_birth || '1985-01-01',
      payer_id: claimData.payer_id || 'p-demo-delta',
      date_of_service: claimData.date_of_service || new Date().toISOString().split('T')[0],
      claim_amount: parseFloat(claimData.claim_amount) || 0,
      clinical_narrative: claimData.clinical_narrative || '',
      owner_id: ownerId,
      readiness_score: 0,
      status: 'DRAFT',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newProcedures = (procedureData || []).map(p => ({
      id: generateId(),
      claim_id: claimId,
      cdt_code: p.cdt_code || 'D2740',
      tooth_number: p.tooth_number || '14',
      amount: parseFloat(p.amount) || newClaim.claim_amount,
      description: p.description || 'Crown - Porcelain/Ceramic Substrate',
      created_at: new Date().toISOString()
    }));

    if (isConfigured) {
      try {
        const { error: cErr } = await supabase.from('claims').insert(newClaim);
        if (!cErr) {
          await supabase.from('procedures').insert(newProcedures);
          return { ...newClaim, procedures: newProcedures };
        }
      } catch (err) {
        console.error('[Supabase DB] Error creating claim:', err.message);
      }
    }

    mockStore.claims.unshift(newClaim);
    newProcedures.forEach(p => mockStore.procedures.push(p));
    return { ...newClaim, procedures: newProcedures };
  },

  updateClaim: async (id, updateFields) => {
    const updatedAt = new Date().toISOString();
    if (isConfigured) {
      await supabase.from('claims').update({ ...updateFields, updated_at: updatedAt }).eq('id', id);
    }
    const idx = mockStore.claims.findIndex(c => c.id === id || c.claim_number === id);
    if (idx !== -1) {
      mockStore.claims[idx] = { ...mockStore.claims[idx], ...updateFields, updated_at: updatedAt };
      return mockStore.claims[idx];
    }
    return null;
  },

  updateProcedure: async (id, updateFields) => {
    if (isConfigured) {
      const { data, error } = await supabase.from('procedures').update(updateFields).eq('id', id).select().single();
      if (!error && data) return data;
    }
    const idx = mockStore.procedures.findIndex(procedure => procedure.id === id);
    if (idx !== -1) {
      mockStore.procedures[idx] = { ...mockStore.procedures[idx], ...updateFields };
      return mockStore.procedures[idx];
    }
    return null;
  },

  // Documents
  saveDocumentMetadata: async (docData) => {
    const doc = {
      id: generateId(),
      claim_id: docData.claim_id,
      file_name: docData.file_name,
      document_type: docData.document_type || 'Other',
      storage_path: docData.storage_path,
      file_size: docData.file_size || 0,
      mime_type: docData.mime_type || 'application/octet-stream',
      extracted_text: docData.extracted_text || '',
      uploaded_at: new Date().toISOString()
    };

    if (isConfigured) {
      const { error } = await supabase.from('documents').insert(doc);
      if (!error) return doc;
    }

    mockStore.documents.push(doc);
    return doc;
  },

  getDocumentsByClaim: async (claimId) => {
    if (isConfigured) {
      const { data, error } = await supabase.from('documents').select('*').eq('claim_id', claimId);
      if (!error && data) return data;
    }
    return mockStore.documents.filter(d => d.claim_id === claimId);
  },

  // Storage
  uploadToStorage: async (bucketName, path, fileBuffer, mimeType) => {
    if (isConfigured) {
      const { data, error } = await supabase.storage.from(bucketName).upload(path, fileBuffer, {
        contentType: mimeType,
        upsert: true
      });
      if (!error && data) {
        const { data: pubUrlData } = supabase.storage.from(bucketName).getPublicUrl(path);
        return pubUrlData ? pubUrlData.publicUrl : path;
      }
      console.warn('[Supabase Storage] Upload error, defaulting path:', error?.message);
    }
    return `mock-storage://${bucketName}/${path}`;
  },

  // Rejection learning / adjudication outcomes
  getRejectionHistory: async (filters = {}) => {
    if (isConfigured) {
      let query = supabase.from('claim_outcomes').select('*').order('created_at', { ascending: false });
      if (filters.payer_id) query = query.eq('payer_id', filters.payer_id);
      if (filters.owner_id) query = query.eq('owner_id', filters.owner_id);
      const { data, error } = await query;
      if (!error && data) return data;
    }
    return mockStore.claimOutcomes.filter(r => (!filters.payer_id || r.payer_id === filters.payer_id) && (!filters.owner_id || r.owner_id === filters.owner_id));
  },

  saveClaimOutcome: async (outcomeData) => {
    const record = {
      id: generateId(),
      claim_id: outcomeData.claim_id || null,
      owner_id: outcomeData.owner_id || null,
      payer_id: outcomeData.payer_id,
      cdt_code: outcomeData.cdt_code || null,
      outcome: outcomeData.outcome,
      rejection_reason: outcomeData.rejection_reason || null,
      rejection_text: outcomeData.rejection_text || '',
      features: outcomeData.features || {},
      created_at: new Date().toISOString()
    };
    if (isConfigured) {
      const { error } = await supabase.from('claim_outcomes').insert(record);
      if (!error) return record;
    }
    mockStore.claimOutcomes.unshift(record);
    return record;
  },

  // Audits & Findings
  saveAuditResult: async (auditData, findingsData) => {
    const auditRecord = {
      id: generateId(),
      claim_id: auditData.claim_id,
      readiness_score: auditData.readiness_score,
      status: auditData.status,
      total_checks: auditData.summary.total_checks,
      passed_checks: auditData.summary.passed,
      warning_checks: auditData.summary.warnings,
      failed_checks: auditData.summary.failed,
      owner_id: auditData.owner_id || null,
      checks_json: auditData.checks,
      requirement_checklist_json: auditData.requirement_checklist || null,
      policy_eligibility_json: auditData.policy_eligibility || null,
      rejection_prediction_json: auditData.rejection_prediction || null,
      created_at: new Date().toISOString()
    };

    const createdFindings = (findingsData || []).map(f => ({
      id: generateId(),
      claim_id: auditData.claim_id,
      audit_result_id: auditRecord.id,
      severity: f.severity,
      finding_type: f.finding_type,
      title: f.title,
      explanation: f.explanation,
      evidence: f.evidence,
      confidence: f.confidence || 0.9,
      recommended_action: f.recommended_action,
      status: 'OPEN',
      created_at: new Date().toISOString()
    }));

    if (isConfigured) {
      const { error: auditError } = await supabase.from('audit_results').insert(auditRecord);
      if (auditError) {
        throw new Error(`Unable to save audit result: ${auditError.message}`);
      }
      if (createdFindings.length > 0) {
        const { error: findingsError } = await supabase.from('findings').insert(createdFindings);
        if (findingsError) {
          throw new Error(`Unable to save audit findings: ${findingsError.message}`);
        }
      }
      const { error: claimError } = await supabase.from('claims').update({
        readiness_score: auditData.readiness_score,
        status: auditData.status,
        updated_at: new Date().toISOString()
      }).eq('id', auditData.claim_id);
      if (claimError) {
        throw new Error(`Unable to update claim audit status: ${claimError.message}`);
      }
    }

    mockStore.auditResults.push(auditRecord);
    createdFindings.forEach(f => mockStore.findings.push(f));

    // Update claim in mock store
    const cIdx = mockStore.claims.findIndex(c => c.id === auditData.claim_id || c.claim_number === auditData.claim_id);
    if (cIdx !== -1) {
      mockStore.claims[cIdx].readiness_score = auditData.readiness_score;
      mockStore.claims[cIdx].status = auditData.status;
      mockStore.claims[cIdx].updated_at = new Date().toISOString();
    }

    return { auditRecord, findings: createdFindings };
  }
};

module.exports = db;
