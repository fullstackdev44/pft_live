'use strict';

const CommonLib = require('../component/lib');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Video = require('../models/Video');
const Channel = require('../models/Channel');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// email notifcation
const sgMail = require('@sendgrid/mail');
// socket notification
const SOCKET_URL = process.env.API_BASE_URL;
var io = require('socket.io-client');
var socket = io.connect(SOCKET_URL, {reconnect: true});
const Notification = require('../models/Notification');
const async = require('async');

class PaymentLib extends CommonLib{

  constructor(){
    super(Payment);
  }

  // retrive public key
  getStripePublicKey(decoded, callback) {
    callback(null, { publicKey: process.env.STRIPE_PUBLISHABLE_KEY })
  }

  updatePurchaseVid = async (user_id,video_id, callback) => {
    try {
      Video.findById(video_id, async (error, video) => {
        let user_already_purchased = video.puchased_by_user;
        const user_index = user_already_purchased.indexOf(user_id);
        if(user_index === -1){
          user_already_purchased.push(user_id);
          video.puchased_by_user = user_already_purchased;
          video.save((err, saved) => {
              if (err) {
                callback(err);
              }
          });
        }
        return callback(null, { update_video: 1});
      });
      } catch (error) {
      console.log(error);
    }
  }
  
  checkMaxParticipants = async (user_id,video_id, callback) => {
    try {
      Video.findById(video_id, async (error, video) => {
        let user_already_purchased = video.puchased_by_user;
        let max_allowed_user = video.live_info.maxNoPeople;
        if(max_allowed_user <= user_already_purchased.length + 1){
          return callback(null, { message: 'full'});
        }else{
          return callback(null, { message: 'ok'});
        }
        
      });
      } catch (error) {
      console.log(error);
    }
  }

  async initiate(body, decoded, callback) {
    console.log("initiating payment intent...");
    try {

      let receiver = {};
      if (body.channel_id){
        const channel = await new Promise((resolve, reject) =>  Channel.findById(body.channel_id).populate('owner').exec((error, data) => resolve(data)));
        receiver = channel.owner;
      }
      else if (body.video_id) {
        const video = await await new Promise((resolve, reject) => Video.findById(body.video_id).populate('user_id').exec((error, data) => resolve(data)));
        receiver = video.user_id;
      }

      const receiver_id = receiver ? ""+receiver._id : null;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: body.amount,
        currency: 'usd', // using the lowest unit: so 100 to charge 1 dollars
        payment_method_types: ['card'],
        metadata: {
          integration_check: 'accept_a_payment',
          sender: body.sender,
          receiver: receiver_id,
          video_id: body.video_id,
          channel_id: body.channel_id,
          purpose: body.purpose,
          donation_message: body.donation_message,
          // For notification
          sender_avatar_color: body.sender_avatar_color,
          sender_avatar_card: body.sender_avatar_card,
          sender_full_name: body.sender_full_name
        },
      });
      console.log("... completed payment intent");
      callback(null, {client_secret: paymentIntent.client_secret, public_key: process.env.STRIPE_PUBLISHABLE_KEY});
    } catch (err) {
      console.log(err);
      callback({error: err.message}, null);
    }
  }


  // https://github.com/stripe/stripe-payments-demo/blob/master/server/node/routes.js
  async handleWebhook(headers, rawBody, callback) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const sig = headers['stripe-signature'];

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    }
    catch (err) {
      return callback({message: err.message}, null); //response.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (!event) // TODO: make sure event are verified
      return callback({message: "Unverified webhook event!"}, null)

    // check for duplicate payment
    const dup_payment = await new Promise((resolve, reject) =>  Payment.find({"stripe_id": event.data.object.id}).exec((error, data) => resolve(data)));
    if (dup_payment.length > 0){
      //console.log("DUPLICATED WEBHOOK..")
      //console.log(dup_payment);
      return callback({message: "Duplicate payment"}, null);
    }

    let intent =  null;
    switch (event.type) {

      case 'payment_intent.created':
        callback(null, {message: 'Received successfully!'})
        break

      case 'payment_intent.succeeded':
        intent = event.data.object;
        //console.log("Succeeded:", intent.id);

        let charges = 0;
        let amount = intent.amount/100;
        //console.log("Donation of " + amount)

        if (intent.metadata.purpose == 'DONATION') {
          charges = (amount * 0.1); // TODO: should not be hardcoded
        }
        else {
          charges = (amount * 0.3);
        }
        amount = amount - charges;

        var  payment  =  new Payment({
          type: intent.metadata.purpose,
          amount: amount, //intent.amount, // TODO: stripe amount is whole number so need to divide it by 100
          sender: intent.metadata.sender,
          receiver: intent.metadata.receiver,
          stripe_data: event.data,
          stripe_id: intent.id,
          fees: [{title: 'PFTV fees', amount: charges}],
          receipt_url: intent.charges.data[0].receipt_url,
          donation_message: intent.metadata.donation_message
        });

        const user = await new Promise((resolve, reject) =>  User.findById(intent.metadata.receiver).exec((error, data) => resolve(data)));

        payment.save(function (err) {
          if (err)
            return callback(err, null);

          //console.log("Payment data saved locally!!");
          // email
          const msg = {
            to: user.email,
            from: {
              email: process.env.PFTV_EMAIL,
              name: 'Project Fitness TV'
            },
            dynamic_template_data: {
              full_name: user.full_name,
              money: (intent.amount/100),
              url_link: 'https://projectfitnesstv.com/user-account/withdrawal'
            },
            template_id: 'd-163d152bb89146e49cf18d853e42065c'
          };

          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          sgMail
            .send(msg)
            .then(() => {

            }, error => {
              console.error(error);
              if (error.response) {
                console.error(error.response.body)
              }
            });

          // notification
          let notifications_sent = [];
          let notification = new Notification();
          notification.sender = payment.sender;
          notification.receiver = payment.receiver;
          notification.type = payment.type;
          notification.status = 'UNREAD';
          notification.donation_payment = payment;
          notification['donation_message'] = payment.donation_message;

          notification.save((err, saved) => {

            if(intent.metadata.sender_avatar_color && intent.metadata.sender_avatar_card && intent.metadata.sender_full_name) {
              saved =  JSON.parse(JSON.stringify(saved));
              saved['sender_avatar_color'] = intent.metadata.sender_avatar_color;
              saved['sender_avatar_card'] = intent.metadata.sender_avatar_card;
              saved['sender_full_name'] = intent.metadata.sender_full_name;
            }

            notifications_sent.push(saved);

            socket.emit('send_notification_to_server', {
              notification: notifications_sent
            });
          });

          callback(null, {message: "successfull!!"});
        });
        break;

      case 'payment_intent.payment_failed':
        intent = event.data.object;
        const message = intent.last_payment_error && intent.last_payment_error.message;
        console.log('Failed:', intent.id, message);
        callback(null, {message: "Unexpected event"})
        break;

      default:
        console.log('Unhandled type:', event.type);
        callback(null, {message: "Unexpected event"})
    }


  }

  getPaymentNotYetComputed(decoded, callback) {
    Payment.find({receiver: decoded._id, added_to_receiver_money: false}).exec(callback);
  }

  addPaymentToReceiver(data, decoded, callback) {

    async.each(data, (payment_id, async_callback) => {

      Payment.findById(payment_id)
        .exec((error, payment) => {

          if(error || !data){
            return callback({type: 'NotFound'});
          }

          payment.added_to_receiver_money = true;

          payment.save(callback);
        });

    },
    (error) => {
      if (error) {
        callback(error);
      } else {
        callback(null, 'done');
      }
    });
  }
}

module.exports = PaymentLib;
