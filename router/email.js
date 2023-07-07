const emailControllers = require('../controllers/emailControllers');

const router = require('express').Router();
//tempimail.org
router.get('/tempimail', emailControllers.getTempimail)
router.get('/tempimail/:id', emailControllers.getMessagesFromTempimail)
//generator.email
router.get('/generator', emailControllers.getGenerator)
router.get('/generator/:email', emailControllers.getMessagesFromGenerator)
//Mohmal.com
router.get('/mohmal', emailControllers.getMohmal)
router.get('/mohmal/:id', emailControllers.getMessagesFromMohmal)
///temp-mailbox.com
router.get('/tempmailbox', emailControllers.getTempMailBox)
router.get('/tempmailbox/:id', emailControllers.getMessagesFromTempMailBox)
///hot-mail.gq
router.get('/hotmail', emailControllers.getHotmail)
router.get('/hotmail/:email', emailControllers.getMessagesFromHotmail)

//https://temp-number.com/
router.get('/number', emailControllers.getCountries )
router.get('/number/:country', emailControllers.getNumber )
router.get('/number/:country/:number', emailControllers.getMessagesFromNumber )
//https://online-sms.org/
router.get('/numberOnline', emailControllers.getNumberOnline )
router.get('/numberOnline/:number', emailControllers.getMessagesFromNumberOnline)
//https://receive-smss.com/
router.get('/numberReceive', emailControllers.getNumberReceive )
router.get('/numberReceive/:number', emailControllers.getMessagesFromNumberReceive )

module.exports = router;