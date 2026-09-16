const express = require('express');
const router = express.Router({ mergeParams: true });
const auditController = require('../controllers/audit.controller');
const { requireDemoUser } = require('../middleware/demoUser');

router.use(requireDemoUser);

router.post('/', auditController.triggerAudit);
router.get('/', auditController.getLatestAudit);
router.get('/findings', auditController.getClaimFindings);
router.post('/re-audit', auditController.triggerReAudit);

module.exports = router;
