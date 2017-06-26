var express = require('express');
var service = require('../modules/chatbot/scripts/chatbotService');
var router = express.Router();

router.post('/message', function (req, res, next) {
    res.send(service.processMessage(req.body.message));
});

module.exports = router;
