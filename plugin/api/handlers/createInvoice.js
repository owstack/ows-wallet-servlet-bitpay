'use strict';

angular.module('owsWalletPlugin.api').service('createInvoice', function(lodash, CHttp) {

	var root = {};

	var REQUIRED_PARAMS = [
		'price',
		'currency'
	];

  root.respond = function(message, callback) {
	  // Request parameters.
    var data = message.request.data;

    // Check required parameters.
    var validRequest = Object.keys(lodash.pick(data, REQUIRED_PARAMS)).length == REQUIRED_PARAMS.length;

    if (!validRequest) {
	    message.response = {
	      statusCode: 400,
	      statusText: 'The request must include ' + REQUIRED_PARAMS.toString() + '.',
	      data: {}
	    };
			return callback(message);
    }

    // Send the request to bitpay endpoint.
    var bitpay = new CHttp('https://bitpay.com/api/');
    bitpay.post('/invoices', data).then(function(reponse) {
	    message.response = {
	      statusCode: 200,
	      statusText: 'OK',
	      data: response
	    };
			return callback(message);

    }).catch(function(error) {
	    message.response = {
	      statusCode: 400,
	      statusText: error,
	      data: {}
	    };
			return callback(message);

    });
	};

  return root;
});
