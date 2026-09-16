/**
 * Payer-specific rejection learning layer.
 *
 * Lightweight, dependency-free k-NN style learner for the demo:
 * - learns from historical claim outcomes
 * - combines payer/CDT/structured documentation similarity with narrative token overlap
 * - returns rejection probability + ranked rejection reasons
 *
 * Replace/augment this with a trained XGBoost/embedding model once real outcomes are available.
 */

const REJECTION_REASONS = {
  INSUFFICIENT_CLINICAL_JUSTIFICATION: 'Insufficient clinical justification',
  MISSING_XRAY: 'Missing supporting radiograph',
  DOCUMENTATION_MISMATCH: 'Documentation / tooth mismatch',
  MISSING_TREATMENT_PLAN: 'Missing treatment plan',
  INCORRECT_CDT: 'Incorrect procedure code',
  NON_COVERED_PROCEDURE: 'Non-covered procedure',
  DUPLICATE_CLAIM: 'Duplicate claim',
  PREAUTHORIZATION: 'Prior authorization / preauthorization required'
};

const TEXT_STOPWORDS = new Set(['the','and','for','with','this','that','from','patient','tooth','claim','clinical','note','has','have','was','are','is','on','of','a','an','in','to']);

function tokenize(text = '') {
  return String(text).toLowerCase()
    .replace(/[^a-z0-9#]+/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !TEXT_STOPWORDS.has(t));
}

function extractFeatures(claim, primaryProc, extractedEvidence = {}, findings = []) {
  const docs = claim.documents || [];
  const docTypes = docs.map(d => String(d.document_type || '').toLowerCase());
  const findingTypes = findings.map(f => f.finding_type);
  const narrative = claim.clinical_narrative || '';

  return {
    payer_id: claim.payer_id,
    cdt_code: primaryProc?.cdt_code || 'UNKNOWN',
    has_xray: docTypes.some(t => t.includes('x-ray') || t.includes('xray') || t.includes('radiograph')),
    has_clinical_note: docTypes.some(t => t.includes('clinical') || t.includes('note')) || narrative.trim().length > 0,
    has_treatment_plan: docTypes.some(t => t.includes('treatment') && t.includes('plan')),
    has_clinical_justification: Boolean(extractedEvidence?.clinical_justification_detected) || Boolean(extractedEvidence?.clinicalJustification) || Boolean(extractedEvidence?.clinical_justification),
    has_tooth_mismatch: findingTypes.includes('DOCUMENTATION_MISMATCH'),
    procedure_valid: !findingTypes.includes('INCORRECT_CDT'),
    narrative_tokens: tokenize(narrative),
    tooth_number: String(primaryProc?.tooth_number || ''),
    amount_band: Number(claim.claim_amount || 0) >= 1000 ? 'HIGH' : 'STANDARD'
  };
}

function similarity(a, b) {
  let score = 0;
  let max = 0;

  const categorical = [
    ['payer_id', 0.30],
    ['cdt_code', 0.18],
    ['amount_band', 0.04],
    ['has_xray', 0.10],
    ['has_clinical_note', 0.07],
    ['has_treatment_plan', 0.06],
    ['has_clinical_justification', 0.10],
    ['has_tooth_mismatch', 0.10],
    ['procedure_valid', 0.05]
  ];

  for (const [key, weight] of categorical) {
    max += weight;
    if (a[key] === b[key]) score += weight;
  }

  const at = new Set(a.narrative_tokens || []);
  const bt = new Set(b.narrative_tokens || []);
  if (at.size && bt.size) {
    const intersection = [...at].filter(t => bt.has(t)).length;
    const union = new Set([...at, ...bt]).size;
    score += 0.10 * (union ? intersection / union : 0);
    max += 0.10;
  }

  return max ? score / max : 0;
}

function confidenceFromCount(count, similarityScore) {
  const volume = Math.min(1, count / 20);
  return Math.min(0.97, Math.max(0.50, 0.50 + similarityScore * 0.30 + volume * 0.17));
}

function predictRejections(claim, primaryProc, extractedEvidence, findings, history = []) {
  const features = extractFeatures(claim, primaryProc, extractedEvidence, findings);
  const labeled = history.filter(h => h.outcome === 'REJECTED' && h.rejection_reason);
  const approved = history.filter(h => h.outcome === 'APPROVED');

  const scored = labeled.map(row => ({ row, similarity: similarity(features, row.features || row) }))
    .sort((a, b) => b.similarity - a.similarity);

  const topK = scored.slice(0, 25);
  const reasonScores = {};
  for (const item of topK) {
    const reason = item.row.rejection_reason;
    reasonScores[reason] = (reasonScores[reason] || 0) + Math.pow(Math.max(item.similarity, 0.05), 2);
  }

  const totalReasonScore = Object.values(reasonScores).reduce((a, b) => a + b, 0) || 1;
  const ranked = Object.entries(reasonScores)
    .map(([reason, value]) => {
      const supporting = topK.filter(x => x.row.rejection_reason === reason).length;
      const avgSim = supporting
        ? topK.filter(x => x.row.rejection_reason === reason).reduce((s, x) => s + x.similarity, 0) / supporting
        : 0;
      return {
        reason,
        label: REJECTION_REASONS[reason] || reason,
        probability: Math.round((value / totalReasonScore) * 100),
        confidence: Number(confidenceFromCount(supporting, avgSim).toFixed(2)),
        supporting_claims: supporting,
        average_similarity: Number(avgSim.toFixed(2))
      };
    })
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 5);

  const similarRejected = topK.filter(x => x.similarity >= 0.45).length;
  const similarApproved = approved
    .map(row => similarity(features, row.features || row))
    .filter(s => s >= 0.45).length;
  const risk = similarRejected + similarApproved > 0
    ? Math.round((similarRejected / (similarRejected + similarApproved)) * 100)
    : 0;

  return {
    model: 'Payer Pattern Learner v1 (similarity-weighted k-NN)',
    trained_on: history.length,
    similar_claims_considered: topK.length,
    rejection_risk: risk,
    top_reasons: ranked,
    primary_reason: ranked[0] || null,
    payer_id: claim.payer_id,
    cdt_code: primaryProc?.cdt_code || 'UNKNOWN',
    feature_snapshot: {
      has_xray: features.has_xray,
      has_clinical_note: features.has_clinical_note,
      has_treatment_plan: features.has_treatment_plan,
      has_clinical_justification: features.has_clinical_justification,
      has_tooth_mismatch: features.has_tooth_mismatch
    }
  };
}

function normalizeOutcomeReason(reason = '') {
  const text = String(reason).toLowerCase();
  if (/x[- ]?ray|radiograph/.test(text)) return 'MISSING_XRAY';
  if (/clinical|medical necessity|justification|supporting evidence/.test(text)) return 'INSUFFICIENT_CLINICAL_JUSTIFICATION';
  if (/tooth|mismatch|inconsistent|documentation/.test(text)) return 'DOCUMENTATION_MISMATCH';
  if (/treatment plan/.test(text)) return 'MISSING_TREATMENT_PLAN';
  if (/cdt|procedure code|code/.test(text)) return 'INCORRECT_CDT';
  if (/authorization|preauth/.test(text)) return 'PREAUTHORIZATION';
  if (/duplicate/.test(text)) return 'DUPLICATE_CLAIM';
  if (/covered|non-covered/.test(text)) return 'NON_COVERED_PROCEDURE';
  return reason;
}

module.exports = {
  REJECTION_REASONS,
  extractFeatures,
  predictRejections,
  normalizeOutcomeReason
};
