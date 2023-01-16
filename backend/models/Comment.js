'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comment = Schema({

	user_id: {type: Schema.Types.ObjectId, ref: 'User', required: true},

	video_id: {type: Schema.Types.ObjectId, ref: 'Video'},
	
	comment: {type: String},
	parent: {type: Schema.Types.ObjectId, ref: 'Comment'},
	
	meta: {
    	likes: [{type: Schema.Types.ObjectId, ref: 'User'}],
    	dislikes: [{type: Schema.Types.ObjectId, ref: 'User'}]
  	},

  	edited: { type: Boolean, default: false },

  created: {type: Date, required: true, default: () => { return new Date() }},
	modified: Date
});

module.exports = mongoose.model('Comment', Comment);
