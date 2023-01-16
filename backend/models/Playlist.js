'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Playlist = Schema({

  videos: [{type: Schema.Types.ObjectId, ref: 'Video'}],
  title: {type: String, required: true},
  detail: {type: String},
  owner: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  channel: {type: Schema.Types.ObjectId, ref: 'Channel'},

  // Copied from others api YouTube or Vimeo (or just a suggestion)
  thumbnails: {type: String},
  update_date: {type: Date}, // we should use our mongo modified field instead (remember that)
  meta: {
    views: {type: Number, default: 0}
  },

  created: {type: Date, required: true, default: () => { return new Date() }},
  modified: Date
});

module.exports = mongoose.model('Playlist', Playlist);
