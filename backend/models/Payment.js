'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Payment = Schema({

  type: {type: String, enum: ['DONATION', 'PURCHASE', 'RENTAL' , 'SUBSCRIPTION', 'UNKOWN'], default: 'UNKOWN', required: true},
  amount: Number,
  fees: [{title: String, amount: Number}],

  sender: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  receiver: {type: Schema.Types.ObjectId, ref: 'User'},
  receipt_url: {type: String},

  video: {type: Schema.Types.ObjectId, ref: 'Video'}, // set for video rental or purchase (VOD)
  channel: {type: Schema.Types.ObjectId, ref: 'Channel'}, // channel set for subscription

  stripe_id: {type: String},
  stripe_data: Object,
  added_to_receiver_money: { type: Boolean, required: true, default: false },

  donation_message: {type: String},

  created: {type: Date, required: true, default: () => { return new Date() }},
  modified: Date
});

// Video.index({tags: 'text'}); // schema level

module.exports = mongoose.model('Payment', Payment);
