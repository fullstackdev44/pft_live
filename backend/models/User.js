'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bcrypt = require('bcrypt');
const saltRounds = 10;

const User = Schema({

  full_name: { type: String, required: true },
  username: { type: String/*, required: true*/ },
  password: { type: String/*, required: true*/ },

  account_type: { type: String, enum: ['USER', 'COACH'], default: 'USER' },

  pro: Boolean,

  avatar: String,
  avatar_card: String,
  avatar_color: Number,
  gender: { type: String, enum: ['M', 'F', 'N/A'], default: 'N/A' },
  dob: Date,
  country: { type: String, default: 'United States' },
  inbox: Number,
  email: { type: String, unique: true },
  phone_number: String,

  facebook_id: String,
  google_id: String,
  twitter_id: String,

  subscribed_channels: [{
    channel: { type: Schema.Types.ObjectId, ref: 'Channel' },
    date: Date,
    status: { type: String, enum: ['Active', 'Inactive', 'Paused'], default: 'Active' }
  }],

  blocked_users: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    date: Date
  }],

  contacts: [{ type: Schema.Types.ObjectId, ref: 'User' }],

  notifications: [{
    name: String,
    status: Boolean
  }],

  // According to Eddy correction on google docs model
  favorite_videos: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
  liked_videos: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
  disliked_videos: [{ type: Schema.Types.ObjectId, ref: 'Video' }],

  // May be it's better if we add history here too
  videos_history: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
  recommendations: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
  // paused_video: {type: Schema.Types.ObjectId, ref: 'Video'},
  // paused_time: Number,
  watch_later_videos: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
  continue_watching_videos: [{ video: {type: Schema.Types.ObjectId, ref: 'Video'}, current_time: Number }],

  search_terms_history: [{ term: String, date: Date }],
  report_history: [{
    inappropriate: Boolean,
    copyrighted: Boolean,
    comment: String,
    video: { type: Schema.Types.ObjectId, ref: 'Video' },
  }],

  playlists: [{ type: Schema.Types.ObjectId, ref: 'Playlist' }],
  purchased_videos: [{ type: Schema.Types.ObjectId, ref: 'Video' }],

  active: { type: Boolean, required: true, default: false },

  money: { type: Number, default: 0 },

  last_login: { type: Date, required: true, default: new Date() },

  created: {type: Date, required: true, default: () => { return new Date() }},
  modified: Date
});


User.pre('save', function(next) {

  this.modified = new Date();

  // check if password is present and is modified.
  if ( this.password && this.isModified('password') ) {
    bcrypt.hash(this.password, saltRounds, (err, hash) => {

      if (err) {
        next({message: 'Error generating hash for password'});
      }

      this.password = hash;

      next();
    });
  }
  else {
    next();
  }
});

module.exports = mongoose.model('User', User);
