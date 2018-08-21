const http = require('http');
const express = require('express');
const Promise = require('bluebird');
const request = require('request-promise');

const app = express();
const port = process.env.PORT | 8080;
const apiKey = process.env.API_KEY;

function buildApiUri(func, symbol) {
    return `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&market=EUR&apikey=${apiKey}`;
}

function sendApiRequest(func, currency) {
    return request({
        method: 'GET',
        uri: buildApiUri(func, currency),
        json: true
    });
}

function getStockData(currencies) {
    var promises = {};
    var func = 'DIGITAL_CURRENCY_INTRADAY';

    currencies.forEach(function(currency) {
        promises[currency] = sendApiRequest(func, currency);
    });

    return Promise.props(promises);
}

app.get('/api/stock', function(req, res, next) {
    var currencies = req.query.currencies.split(',');

    getStockData(currencies).then(function(stockData) {
        res.status(200).json(stockData).end();
    });

});

app.use(express.static('public'));

app.listen(port, function() {
    console.log(`App listening on ${port}`);
});
