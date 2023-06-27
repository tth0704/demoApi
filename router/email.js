const emailControllers = require('../controllers/emailControllers');

const router = require('express').Router();
//tempimail.org
router.get('/tempimail', emailControllers.getTempimail)
router.get('/tempimail/:id', emailControllers.getMessagesFromTempimail)
//generator.email
router.get('/generator', emailControllers.getGenerator)
router.get('/generator/:email', emailControllers.getMessagesFromGenerator)
module.exports = router;