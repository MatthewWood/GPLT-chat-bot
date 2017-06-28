var labelErrorsService = require('./labelErrorsService');
var customerServiceTicketService = require('./customerServiceTicketService');
var apiai = require('apiai');
var processor = apiai('5f05b245897e45ae9d0e7e114a55719f');
var mockHermesDown = false;

const uuidv1 = require('uuid/v1');

module.exports.processMessage = function (req, res) {

    var message = req.body.message;

    var sessionId = uuidv1();
    var request = processor.textRequest(message, {
        sessionId: sessionId
    });

    request.on('response', function (response) {
        console.log(response.result.fulfillment.speech);
        processAiResponse(response, function (returnText) {
            return res.send(returnText);
        });
    });

    request.on('error', function (error) {
        var date = new Date();
        console.log(date.toDateString() + ': ' + JSON.stringify(error));
        return res.send(date.toDateString() + ': ' + 'Error from APIAI!');
    });

    request.end();
};

var processAiResponse = function (aiResponse, callback) {
    if (aiResponse.result.fulfillment.speech === '') {
        // TODO make this into normal foprloop
        var responseMessages = aiResponse.result.fulfillment.messages;
        for (var i = 0; i < responseMessages.length; i++) {
            if (responseMessages[i].type === 4) {
                switch (responseMessages[i].payload.problem) {
                    case 'can not print label':
                        var carrier = aiResponse.result.parameters.carrier ? aiResponse.result.parameters.carrier : 'none';
                        labelErrorsService.investigate(mockHermesDown, carrier, function (returnText) {
                            return callback(returnText);
                        });
                        break;
                    case 'need to create a ticket' :
                        customerServiceTicketService.createTicket(function (returnText) {
                            return callback(returnText);
                        });
                        break;
                }
            }
        }
    } else {
        return callback(aiResponse.result.fulfillment.speech);
    }
};