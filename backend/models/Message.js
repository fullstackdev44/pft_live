'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Message = Schema({

	sender: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	receiver: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	object: {type: String},
	content: {type: String, required: true},
	status: {type: String, enum: ['SENT', 'DELETED', 'READ', 'UNREAD'], default: 'SENT', required: true},

  created: {type: Date, required: true, default: () => { return new Date() }},
	modified: Date
});

module.exports = mongoose.model('Message', Message);
