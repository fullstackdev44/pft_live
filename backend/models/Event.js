'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Event = Schema({

  object: { type: String, enum: ["VIDEO", "CHANNEL"], default: "VIDEO", required: true },
  ref: { type: String, required: true }, //ObjectId
  groupRef: { type: String }, //ObjectId (for grouped elements: add channel ref for videos)
  type: { type: String, enum: ["VIEW", "COMMENT", "CREATION"] },
  user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  // Hasina
  hidden: { type: Boolean, default: false }, // Used in updates from subscriptions detail in fronted inside side bar menu

  created: {type: Date, required: true, default: () => { return new Date() }},
  modified: Date
});

module.exports = mongoose.model('Event', Event);
