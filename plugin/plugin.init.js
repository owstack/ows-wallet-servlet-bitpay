'use strict';

angular.module('owsWalletPlugin').config(function() {

  // Nothing to do.

})
.run(function($rootScope, ApiRouter, bitpayService) {

  // Listen for the client service to become ready, do some initialization.
  $rootScope.$on('$pre.ready', function(event, session) {
    bitpayService.init(session);

	  /**
	   * API routes for our service.
	   * A match is made by searching routes in order, the first match returns the route.
	   */

	  ApiRouter.addRoutes([
	    { path: '/bitpay/invoices', method: 'POST', handler: 'createInvoice' }
	  ]);
	  
  });

});
