var apiai = require('apiai');
var processor = apiai('5f05b245897e45ae9d0e7e114a55719f');

const uuidv1 = require('uuid/v1');

module.exports.processMessage = function (req, res) {

    var message = req.body.message;

    var sessionId = uuidv1();
    var request = processor.textRequest(message, {
        sessionId: sessionId
    });

    request.on('response', function (response) {
        console.log(response.result.fulfillment.speech);
        return res.send(processAiResponse(response));
    });

    request.on('error', function (error) {
        var date = new Date();
        console.log(date.toDateString() + ': ' + JSON.stringify(error));
        return res.send(date.toDateString() + ': ' + 'Error from APIAI!');
    });

    request.end();
};

var processAiResponse = function (aiResponse) {
    if (aiResponse.result.fulfillment.speech === '') {
        // TODO make this into normal foprloop
        aiResponse.result.fulfillment.messages.forEach(function (responseMessage) {
            if (responseMessage.type === 4) {
                if (responseMessage.payload.problem !== '') {
                    return responseMessage.payload.problem;
                }
            }
        });
    } else {
        return aiResponse.result.fulfillment.speech;
    }
};
