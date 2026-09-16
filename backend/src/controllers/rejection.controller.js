const db = require('../config/supabase');
const { extractFeatures, predictRejections, normalizeOutcomeReason } = require('../services/rejectionLearning');

async function predictForClaim(req, res, next) {
  try {
    const claim = await db.getClaimById(req.params.claimId, req.demoUserId);
    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });
    const proc = claim.procedures?.[0] || { cdt_code: 'D2740', tooth_number: '14' };
    const history = await db.getRejectionHistory({ payer_id: claim.payer_id, owner_id: req.demoUserId });
    const audit = claim.latest_audit;
    const result = predictRejections(
      claim,
      proc,
      audit?.extracted_evidence || {},
      claim.findings || [],
      history
    );
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

async function getPayerPatterns(req, res, next) {
  try {
    const history = await db.getRejectionHistory({ payer_id: req.query.payer_id, owner_id: req.demoUserId });
    const rejected = history.filter(h => h.outcome === 'REJECTED' && h.rejection_reason);
    const counts = rejected.reduce((acc, r) => {
      acc[r.rejection_reason] = (acc[r.rejection_reason] || 0) + 1;
      return acc;
    }, {});
    const total = rejected.length || 1;
    const patterns = Object.entries(counts)
      .map(([reason, count]) => ({ reason, count, percentage: Math.round(count / total * 100) }))
      .sort((a, b) => b.count - a.count);
    res.json({ success: true, data: { trained_on: history.length, rejected_claims: rejected.length, patterns } });
  } catch (err) { next(err); }
}

async function getHistory(req, res, next) {
  try {
    const history = await db.getRejectionHistory({ payer_id: req.query.payer_id, owner_id: req.demoUserId });
    res.json({ success: true, count: history.length, data: history });
  } catch (err) { next(err); }
}

async function recordOutcome(req, res, next) {
  try {
    const { claim_id, payer_id, cdt_code, outcome, rejection_reason, rejection_text, features } = req.body;
    if (!outcome || !['APPROVED', 'REJECTED'].includes(outcome)) {
      return res.status(400).json({ success: false, message: 'outcome must be APPROVED or REJECTED' });
    }
    if (!claim_id || !payer_id || !cdt_code) {
      return res.status(400).json({ success: false, message: 'claim_id, payer_id, and cdt_code are required' });
    }
    if (outcome === 'REJECTED' && !String(rejection_reason || rejection_text || '').trim()) {
      return res.status(400).json({ success: false, message: 'A rejection reason or payer response is required for rejected claims' });
    }
    const normalized = outcome === 'REJECTED' ? normalizeOutcomeReason(rejection_reason || rejection_text) : null;
    const record = await db.saveClaimOutcome({
      claim_id, payer_id, cdt_code, outcome,
      rejection_reason: normalized,
      rejection_text: rejection_text || '',
      features: features || {},
      owner_id: req.demoUserId
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) { next(err); }
}

module.exports = { predictForClaim, getPayerPatterns, getHistory, recordOutcome };
