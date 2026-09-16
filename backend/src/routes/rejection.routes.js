const express = require('express');
const router = express.Router();
const controller = require('../controllers/rejection.controller');
const { requireDemoUser } = require('../middleware/demoUser');

router.use(requireDemoUser);

router.get('/patterns', controller.getPayerPatterns);
router.get('/history', controller.getHistory);
router.post('/outcomes', controller.recordOutcome);
router.post('/predict/:claimId', controller.predictForClaim);

module.exports = router;
