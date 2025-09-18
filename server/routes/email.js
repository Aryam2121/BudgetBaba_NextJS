const express = require('express');
const auth = require('../middleware/auth');
const emailController = require('../controllers/emailController');

const router = express.Router();

// Gmail OAuth routes
router.get('/gmail/connect', auth, emailController.initiateGmailAuth);
router.get('/gmail/callback', emailController.handleGmailCallback);
router.post('/gmail/test', auth, emailController.testEmailConnection);

// Outlook OAuth routes  
router.get('/outlook/connect', auth, emailController.initiateOutlookAuth);
router.get('/outlook/callback', emailController.handleOutlookCallback);
router.post('/outlook/test', auth, emailController.testEmailConnection);

// Email status and preferences
router.get('/status', auth, emailController.getEmailStatus);
router.put('/preferences', auth, emailController.updateEmailPreferences);
router.delete('/disconnect/:provider', auth, emailController.disconnectEmailProvider);

// Test connection
router.post('/test/:provider', auth, emailController.testEmailConnection);

module.exports = router;