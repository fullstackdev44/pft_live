'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Withdrawal = Schema({

  amount: { type: Number, required: true, default: 0 },
  user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  paypal_email: { type: String },
  note: { type: String },
  status: { type: String, enum: ['PENDING', 'COMPLETE', 'REJECTED'], default: 'PENDING' },
  staff_notes: {type: String, default: ''},
  created: {type: Date, required: true, default: () => { return new Date() }},
  fees: {type: Number},
  modified: Date
});

module.exports = mongoose.model('Withdrawal', Withdrawal);
