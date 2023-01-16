'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Notification = Schema({

	sender: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	receiver: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	status: {type: String, enum: ['READ', 'UNREAD'], default: 'UNREAD', required: true},

	// type can be expended:
	// NEW VIDEO PUBLISHED, EXPIRATION OF SUBSCRIPTION, HIRE/LIVE REQUEST, NEW LIKED VIDEO, REPORTED VIDEO, ...
	type: {type: String, enum: ['COMMENT', 'SUBSCRIPTION', 'DONATION', 'UNKOWN'], default: 'UNKOWN', required: true},

	// content changes by type field value:
	comment: {type: Schema.Types.ObjectId, ref: 'Comment'},
	subscription_channel: {type: Schema.Types.ObjectId, ref: 'Channel'},
	sender_channel: {type: Schema.Types.ObjectId, ref: 'Channel'},
	donation_payment: {type: Schema.Types.ObjectId, ref: 'Payment'},
	donation_message: {type: String},

  created: {type: Date, required: true, default: () => { return new Date() }},
	modified: Date
});

module.exports = mongoose.model('Notification', Notification);
