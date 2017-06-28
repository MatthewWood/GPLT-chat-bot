nlp = window.nlp_compromise;

var messages = [], //array that hold the record of each string in chat
    botName = 'eBae', //name of the chatbot
    talking = true; //when false the speach function doesn't work

var ENTER_KEY = 13;

function chatbotResponse(userMessage, callback) {
    talking = true;

    var data = {
        message: userMessage
    };
    if (userMessage.includes('responsive')) {
        return callback('No, but I am accessible!', true);
    } else {
        $.post("chatbot/message", data, function (data, status) {
            if (status === 'success') {
                return callback(data, false);
            }
            return callback('Error from server.', false);
        });
    }


}

// called when enter is pressed
function newEntry() {
    if (document.getElementById('chatbox').value !== '') {
        //pulls the value from the chatbox ands sets it to userMessage
        var userMessage = document.getElementById('chatbox').value;
        //sets the chat box to be clear
        document.getElementById('chatbox').value = '';
        //adds the value of the chatbox to the array messages
        messages.push('<b>You:</b> ' + userMessage);
        printMessages();
        //sets the variable botMessage in response to userMessage
        chatbotResponse(userMessage, function (response, speech) {
            //add the chatbot's name and message to the array messages
            messages.push('<b>' + botName + ':</b> ' + response);
            // says the message using the text to speech function written below
            if (speech) {
                Speech(response);
            }
            //outputs the last few array elements of messages to html
            printMessages();
        });
    }
}

function Speech(say) {
    if ('speechSynthesis' in window && talking) {
        var utterance = new SpeechSynthesisUtterance(say);
        speechSynthesis.speak(utterance);
    }
}

function keyPress(e) {
    var x = e || window.event;
    var key = (x.keyCode || x.which);
    if (key === ENTER_KEY) { // check if key is the enter button
        newEntry();
    }
}

function placeHolder() {
    document.getElementById('chatbox').placeholder = '';
}

function printMessages() {
    for (var i = 1; i < 8; i++) {
        if (messages[messages.length - i])
            document.getElementById('chatlog' + i).innerHTML = messages[messages.length - i];
    }
}

document.onkeypress = keyPress;

