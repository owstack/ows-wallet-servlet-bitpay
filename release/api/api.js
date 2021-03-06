'use strict';

angular.module('owsWalletPlugin.api.bitpay', []).namespace().constant('BitPayServlet', 
{
  id: 'org.openwalletstack.wallet.plugin.servlet.bitpay'
});

'use strict';

angular.module('owsWalletPlugin.api.bitpay').factory('BitPay', ['lodash', '$log', 'ApiMessage', 'owsWalletPluginClient.api.ApiError', 'owsWalletPlugin.api.bitpay.BitPayServlet', 'owsWalletPlugin.api.bitpay.Invoice', 'owsWalletPluginClient.api.PluginApiHelper', 'owsWalletPluginClient.api.Transaction', function (lodash, $log, ApiMessage,
  /* @namespace owsWalletPluginClient.api */ ApiError,
  /* @namespace owsWalletPlugin.api.bitpay */ BitPayServlet,
  /* @namespace owsWalletPlugin.api.bitpay */ Invoice,
  /* @namespace owsWalletPluginClient.api */ PluginApiHelper,
  /* @namespace owsWalletPluginClient.api */ Transaction) {

  /**
   * Constructor.
   * @param {Object} config - The configuration ID for the servlet.
   * @constructor
   *
   * config = {
   *   api: {
   *     url: <string>,
   *     auth: {
   *       token: <string>
   *     },
   *   },
   *   transactionSpeed: <string>,
   *   notificationEmail: <string>,
   *   notificationURL: <string>,
   *   invoice: {
   *     required: <array>
   *   }
   * }
   *
   * invoice.required - an array of strings listing the required field for creating an invoice.
   *   Exmaple ['buyer.name', 'buyer.email', 'buyer.phone' , 'buyer.address1' , 'buyer.locality', 'buyer.region', 'buyer.postalCode']
   */
  function BitPay(configId) {
    var self = this;

    var servlet = new PluginApiHelper(BitPayServlet);
    var apiRoot = servlet.apiRoot();
    var config = servlet.getConfig(configId);

    /**
     * Public functions
     */

    /**
     * BitPay creates invoices in these currencies only.
     * @return {array} An array of currency codes.
     */
     this.getInvoiceCurrencies = function() {
       return ['BCH', 'BTC'];
     };

    /**
     * Create a new invoice.
     * @param {Object} data - Payment request data.
     * @return {Promise<Invoice>} A promise for the invoice.
     *
     * @See https://bitpay.com/api#resource-Invoices
     *
     * data = {
     *   price: [required] <number>,
     *   currency: [required] <string>,
     *   orderId: <string>,
     *   itemDesc: <string>,
     *   itemCode: <string>,
     *   posData: <string>,
     *   physical: <boolean>,
     *   buyer: {
     *     name: <string>,
     *     address1: <string>,
     *     address2: <string>,
     *     locality: <string>,
     *     region: <string>,
     *     postalCode: <string>,
     *     country: <string>,
     *     email: <string>,
     *     phone: <string>,
     *     notify: <string>
     *   },
     *   transactionSpeed: <string>,
     *   notificationEmail: <string>,
     *   notificationURL: <string>
     * }
     */
    this.createInvoice = function(data) {
      var request = {
        method: 'POST',
        url: apiRoot + '/bitpay/invoices',
        data: {
          config: config,
          data: data
        }
      };

      return new ApiMessage(request).send().then(function(response) {
        return new Invoice(response.data);

      }).catch(function(error) {
        throw new ApiError(error);
        
      });
    };

    /**
     * Convenience function to send a payment through this BitPay instance. This function handles creating the invoice,
     * creating the wallet transaction, confirming the transaction, and sending the payment.
     * @param {Object} wallet - A Wallet object.
     * @param {Object} data - An Invoice object.
     * @param {function} confirmHanlder - A function that is called when the payment must be confirmed before sending.
     * @return {Promise} A promise at completion.
     */
    this.sendPayment = function(wallet, data, confirmHandler) {
      return self.createInvoice(data).then(function(invoice) {
        $log.debug('Got invoice: ' + JSON.stringify(invoice));

        // Create an accessor for the payment URL.
        var c = wallet.currency.toUpperCase();

        // Create a new transaction for paying the invoice.
        return new Transaction({
          walletId: wallet.id,
          urlOrAddress: invoice.paymentCodes[c].BIP73
        });

      }).then(function(tx) {

        if (tx.shouldConfirm) {
          confirmHandler().then(function() {
            tx.send();

          }).catch(function() {
            // User did not confirm.
            // Catch and discard.
          });

        } else {
          tx.send();

        }
        return;

      }).catch(function(error) {
        throw new ApiError(error);
      });
    };

    return this;
  };
 
  return BitPay;
}]);

'use strict';

angular.module('owsWalletPlugin.api.bitpay').factory('Invoice', ['lodash', function (lodash) {

  /**
   * Sample invoice response
   * {
   *   facade:'pos/invoice',
   *   data:{
   *     url:'https://bitpay.com/invoice?id=DNN1kKv76MMH1jpDJZpcgH',
   *     status:'new',
   *     btcPrice:'0.228969',
   *     btcDue:'0.228969',
   *     price:100,
   *     currency:'USD',
   *     exRates:{
   *       'USD':436.74
   *     },
   *     invoiceTime:1450723391747,
   *     expirationTime:1450724291747,
   *     currentTime:1450723391896,
   *     guid:'1450723391611',
   *     id:'DNN1kKv76MMH1jpDJZpcgH',
   *     btcPaid:'0.000000',
   *     rate:436.74,
   *     exceptionStatus:false,
   *     paymentUrls:{
   *       BIP21:'bitcoin:1JQjMP4QM9WP2zXa9qPbaPZ9sfTcqVXTvA?amount=0.228969',
   *       BIP72:'bitcoin:1JQjMP4QM9WP2zXa9qPbaPZ9sfTcqVXTvA?amount=0.228969&r=https://bitpay.com/i/DNN1kKv76MMH1jpDJZpcgH',
   *       BIP72b:'bitcoin:?r=https://bitpay.com/i/DNN1kKv76MMH1jpDJZpcgH',
   *       BIP73:'https://bitpay.com/i/DNN1kKv76MMH1jpDJZpcgH'
   *     },
   *     token:2N4ZLhiqcncAT8met5SVxLPfrZGAc92RaECR6PSFikdjvMw8jCGKSvHc1ByWYtzWLm'
   *   }
   * }
   */

  /**
   * Constructor.  An instance of this class must be obtained from BitPay.
   * @param {Object} plugin - An internal BitPay invoice object.
   * @return {Object} An instance of Invoice.
   * @constructor
   */
  function Invoice(invoiceObj) {
    lodash.assign(this, invoiceObj);
    return this;
  };
 
  return Invoice;
}]);
