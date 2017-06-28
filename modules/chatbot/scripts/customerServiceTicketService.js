var zenDesk = require('node-zendesk');

var client = zenDesk.createClient({
    username: 'matthewwood4uk@gmail.com',
    token: '0yTNqUIg7blU5LJjuMLScSNjJN2QXeuYtoF3lLH5',
    remoteUri: 'https://hackweek.zendesk.com/api/v2'
});


module.exports.createTicket = function (email, name, message, callback) {
    console.log('attempting to create a ticket...');

    var ticketData = {
        "ticket": {
            "requester": {"name": name, "email": email},
            "submitter_id": 410989,
            "subject": "Ticket From eBae",
            "comment": {"body": message}
        }
    };
    client.tickets.create(ticketData, function (err, req, result) {
        if (err) {
            console.log(err);
            return callback('Error from ZenDesk!');
        }
        callback('Your ticket has been created under ' + email + '. We will get back to you as soon as we can.');
    });


};
