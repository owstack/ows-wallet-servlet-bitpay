'use strict';

angular.module('owsWalletPluginClient.api').factory('CBitPayInvoice', function (lodash) {

  /**
   * Sample invoice reponse
   * {
   *   "facade":"pos/invoice",
   *   "data":{
   *     "url":"https://bitpay.com/invoice?id=DNN1kKv76MMH1jpDJZpcgH",
   *     "status":"new",
   *     "btcPrice":"0.228969",
   *     "btcDue":"0.228969",
   *     "price":100,
   *     "currency":"USD",
   *     "exRates":{
   *       "USD":436.74
   *     },
   *     "invoiceTime":1450723391747,
   *     "expirationTime":1450724291747,
   *     "currentTime":1450723391896,
   *     "guid":"1450723391611",
   *     "id":"DNN1kKv76MMH1jpDJZpcgH",
   *     "btcPaid":"0.000000",
   *     "rate":436.74,
   *     "exceptionStatus":false,
   *     "paymentUrls":{
   *       "BIP21":"bitcoin:1JQjMP4QM9WP2zXa9qPbaPZ9sfTcqVXTvA?amount=0.228969",
   *       "BIP72":"bitcoin:1JQjMP4QM9WP2zXa9qPbaPZ9sfTcqVXTvA?amount=0.228969&r=https://bitpay.com/i/DNN1kKv76MMH1jpDJZpcgH",
   *       "BIP72b":"bitcoin:?r=https://bitpay.com/i/DNN1kKv76MMH1jpDJZpcgH",
   *       "BIP73":"https://bitpay.com/i/DNN1kKv76MMH1jpDJZpcgH"
   *     },
   *     "token":"2N4ZLhiqcncAT8met5SVxLPfrZGAc92RaECR6PSFikdjvMw8jCGKSvHc1ByWYtzWLm"
   *   }
   * }
   */

  /**
   * Constructor.  An instance of this class must be obtained from CBitPay.
   * @param {Object} plugin - An internal BitPay invoice object.
   * @return {Object} An instance of CBitPayInvoice.
   * @constructor
   */
  function CBitPayInvoice(invoiceObj) {
    lodash.assign(this, invoiceObj);
    return this;
    };

  };
 
  return CBitPayInvoice;
});
