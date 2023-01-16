'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = Schema({
	name: {type: String, required: true},
	link: {type: String, required: true},
	website_logo: String,
	image: String,

	price: Number,

	discount:{
		code: String,
		discount: Number
	},

	created: {type: Date, required: true, default: () => { return new Date() }},
	modified: Date
})

module.exports = mongoose.model("Product", Product);
