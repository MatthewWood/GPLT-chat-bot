var labelErrorsService = require('./labelErrorsService');
var customerServiceTicketService = require('./customerServiceTicketService');
var apiai = require('apiai');
var processor = apiai('5f05b245897e45ae9d0e7e114a55719f');

const uuidv1 = require('uuid/v1');
var sessionId = uuidv1();

module.exports.processMessage = function (req, res) {

    var message = req.body.message;

    var request = processor.textRequest(message, {
        sessionId: sessionId
    });

    request.on('response', function (response) {
        console.log(response.result.fulfillment.speech);
        processAiResponse(response, function (returnText) {
            return res.send({answer: returnText});
        });
    });

    request.on('error', function (error) {
        var date = new Date();
        console.log(date.toDateString() + ': ' + JSON.stringify(error));
        return res.send({answer: date.toDateString() + ': ' + 'Error from APIAI!'});
    });

    request.end();
};

var processAiResponse = function (aiResponse, callback) {
    var trigger = getTriggerInstructions(aiResponse);
    if (trigger) {
        switch (trigger) {
            case 'can not print label':
                var carrier = aiResponse.result.parameters.carrier ? aiResponse.result.parameters.carrier : 'none';
                labelErrorsService.investigate(carrier, function (returnText) {
                    return callback(returnText);
                });
                break;
            case 'need to create a ticket' :
                var email = aiResponse.result.parameters.email;
                var name = aiResponse.result.parameters.name;
                var message = aiResponse.result.parameters.message;
                customerServiceTicketService.createTicket(email, name, message, function (returnText) {
                    return callback(returnText);
                });
                break;
        }
    } else {
        return callback(aiResponse.result.fulfillment.speech);
    }
};

var getTriggerInstructions = function (aiResponse) {
    var responseMessages = aiResponse.result.fulfillment.messages;
    for (var i = 0; i < responseMessages.length; i++) {
        if (responseMessages[i].type === 4) {
            return responseMessages[i].payload.trigger;
        }
    }

    return null;
}