'use strict';

const CommonApi = require('../component/api');
const InputValidate = require('../component/inputValidate');

const PaymentLib = require('../lib/PaymentLib');
const Payment = require('../models/Payment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');

class PaymentApi extends CommonApi{

  constructor(){

    super('payment', Payment, PaymentLib);

    this.router.route('/stripe_public_key').get((request, response, next) => {
	   this.wrap(this.modelLib.getStripePublicKey,  request.decoded, request, next);
	  })

    this.router.route('/initiate').post(async (request, response, next) => {
	    this.wrap(this.modelLib.initiate, request.body, request.decoded, request, next);
	  })

    this.router.route('/donate/:user_id').post((request, response, next) => {
	   this.wrap(this.modelLib.donate, request.body, request.decoded, request, next);
	  })
    this.router.route('/updatePurchaseVid').post((request, response, next) => {
      this.wrap(this.modelLib.updatePurchaseVid, request.body.user_id,request.body.video_id, request, next);
    })
    this.router.route('/checkMaxParticipants').post((request, response, next) => {
      this.wrap(this.modelLib.checkMaxParticipants, request.body.user_id,request.body.video_id, request, next);
    })
    this.router.route('/webhook').post((request, response, next) => {
      // BE AWARE: This webhook needs rawBody not body
      this.modelLib.handleWebhook(request.headers, request.rawBody, function(error, data){
        if (error)
           return response.status(400).send({'message':  error});
        else
          return response.json({received: true});
      })
	  })

    this.router.route('/not_yet_computed').get((request, response, next) => {
		this.wrap(this.modelLib.getPaymentNotYetComputed, request.decoded, request, next);
	})

	this.router.route('/addPaymentToReceiver').post((request, response, next) => {
		this.wrap(this.modelLib.addPaymentToReceiver, request.body, request.decoded, request, next);
	})

  }
}

module.exports = PaymentApi;
