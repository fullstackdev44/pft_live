'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Channel = Schema({

  unique_id: {type: String, unique: true},

  title: {type: String, required: true},
  detail: {type: String},
  avatar_color: Number,
  avatar_card: String,
  verified: Boolean,
  profile_image: String,
  profile_image_offset: {type: Number, default: 0},
  profile_image_height: {type: Number, default: 100},
  profile_image_width: {type: Number, default: 100},

  owner: {type: Schema.Types.ObjectId, ref: 'User', required: true},

  meta: {
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },

    views: { type: Number, default: 0 },
    subscribers: { type: Number, default: 0 },
    videos: { type: Number, default: 0 }
  },

  // Copied from others api YouTube or Vimeo (or just a suggestion)
  viewers: [{type: Schema.Types.ObjectId, ref: 'User'}],
  subscribers: [{type: Schema.Types.ObjectId, ref: 'User'}],
  playlists: [{type: Schema.Types.ObjectId, ref: 'Playlist'}],
  featured_videos: [{type: Schema.Types.ObjectId, ref: 'Video'}],
  featured_channels: [{type: Schema.Types.ObjectId, ref: 'Channel'}],
  categories: [{type: Schema.Types.ObjectId, ref: 'Category'}],
  // featured_products: [{type: Schema.Types.ObjectId, ref: 'Product'}],
  featured_products: [
    {
      name: {type: String, required: true},
      link: {type: String },
      website_logo: String,
      image: String,
      price: Number,
      discount:{
        code: String,
        discount: Number
      }
    }
  ],

  links: [{name: String, url: String}],
  business_inquiries: [{name: String, url: String}],

  flags: [{inappropriate: Boolean, copyrighted: Boolean, comment: String, user: {type: mongoose.Types.ObjectId, ref: 'User'}}],

  active: { type: Boolean, required: true, default: false },

  created: {type: Date, required: true, default: () => { return new Date() }},
  modified: Date
});

module.exports = mongoose.model('Channel', Channel);
