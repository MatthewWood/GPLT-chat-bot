var FeedMe = require('feedme');
var http = require('http');
var fs = require('fs');

const TWENTY_FOUR_HOURS_IN_MS = 86400 * 1000;

module.exports.investigate = function (mock, carrier, callback) {

    // TODO maybe make a settable config with carriers and status and go read it here first
    // TODO can be controlled by devs because they might know before Scurri
    // lets first look at the config
    var carrierConfig = JSON.parse(fs.readFileSync('resources/carrier_status.json', 'utf8'));
    for (var i = 0; i < carrierConfig.carriers.length; i++) {
        if (!carrierConfig.carriers[i].status) {
            return callback(getCarrierErrorMessage(carrierConfig.carriers[i].name))
        }
    }
    console.log(carrierConfig);

    if (mock === true) {
        return callback('There seems to be an ongoing issue with Hermes, please use another carrier or try again later.');
    }

    http.get('http://status.scurri.co.uk/history.atom', function (res) {
        var parser = new FeedMe(true);
        res.pipe(parser);
        parser.on('end', function () {
            var parsedFeed = parser.done();
            processScurriFeed(parsedFeed, carrier, function (returnText) {
                return callback(returnText);
            });
        });
    });
};

var processScurriFeed = function (jsonFeed, carrier, callback) {
    // console.log(jsonFeed);
    for (var i = 0; i < jsonFeed.items.length; i++) {
        var incidentDate = new Date(jsonFeed.items[i].published);
        if (isWithinDateRange(incidentDate)) {
            if (jsonFeed.items[i].title.toLowerCase().includes(carrier)) {
                return callback(getCarrierErrorMessage(carrier));
            }
        } else {
            break;
        }
    }

    // TODO if there is no recorded problem, we should direct them to creating a ticket
    return callback('I AM TEMPORARY! ALSO ' + carrier.toUpperCase() + ' IS FINE LUL');
};

var isWithinDateRange = function (incidentDate) {
    var now = new Date();
    return (now.getTime() - TWENTY_FOUR_HOURS_IN_MS) < incidentDate.getTime();

};

var getCarrierErrorMessage = function (carrier) {
    return 'There seems to be an ongoing issue with ' + carrier + ', please use another carrier or try again later.'
};