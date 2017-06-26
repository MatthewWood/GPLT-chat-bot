var express = require('express');
var service = require('../modules/chatbot/scripts/chatbotService');
var router = express.Router();

router.post('/message', function (req, res) {
    service.processMessage(req, res);
});

module.exports = router;
