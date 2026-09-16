const express = require('express');
const router = express.Router();
const payerController = require('../controllers/payer.controller');
const { requireDemoUser } = require('../middleware/demoUser');

router.use(requireDemoUser);

router.get('/', payerController.getPayers);
router.get('/:id/rules', payerController.getPayerRules);

module.exports = router;
