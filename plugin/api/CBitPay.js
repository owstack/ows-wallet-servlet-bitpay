'use strict';

angular.module('owsWalletPlugin.api').factory('CBitPay', function (lodash, ApiMessage, CSession) {

  /**
   * Constructor.
   * @param {Object} config - The configuration for the servlet.
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
  function CBitPay(store) {
    var config = CSession.getInstance().plugin.dependencies['org.openwalletstack.wallet.plugin.servlet.bitpay'][store];

    if (!config) {
      return;
    }

    /**
     * Public functions
     */

    /**
     * Create a new invoice.
     * @param {Object} data - Payment request data.
     * @return {Promise<CBitPayInvoice>} A promise for the invoice.
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
    this.createInvoice = function(data, callback) {
      var self = this;
      var request = {
        method: 'POST',
        url: '/bitpay/invoices',
        data: {
          config: config,
          data: data
        },
        responseObj: 'CBitPayInvoice'
      }

      return new ApiMessage(request).send();
    };

    return this;
  };
 
  return CBitPay;
});
