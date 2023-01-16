'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Video = Schema({

  title: {type: String, required: true},
  description: {type: String},
  orientation: {type: String},
  active: {type: Boolean, default: true, required: true},
  upload_status: {type: String, enum: ['PENDING', 'COMPLETE'], default: 'PENDING', required: true}, // uploaded and transcoded status
  short_id: {type: String, unique: true, required: true},
  source_id: {type: String},
  monetize: {type: Boolean, default: false},
  privacy_settings: {type: String, enum: ['PUBLIC', 'PRIVATE', 'UNLISTED'], default: 'PUBLIC', required: true},
  license: {type: String},
  tags: String,
  products: [
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
  ], // subdocument (https://stackoverflow.com/questions/21302279/embedded-document-vs-reference-in-mongoose-design-model)
  categories: [{type: Schema.Types.ObjectId, ref: 'Category'}],
  size: Number,
  user_id: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  meta: {
    likes: {type: Number, default: 0},
    dislikes: {type: Number, default: 0},
    views: {type: Number, default: 0},
    total_viewer:{ type : Array , "default" : [] }
  },
  duration: Number,
  width: Number,
  height: Number,
  // resolution: {type: String}, // used in search, I use above video height and width instead of it
  channel_id: {type: Schema.Types.ObjectId, ref: 'Channel'},
  vimeo: {
    picture_id: {type: String},
    video_url_link: {type: String}
  },
  // Copied from others api YouTube or Vimeo (just a suggestion)
  thumbnail: {type: String},
  authorized_users: [{type: Schema.Types.ObjectId, ref: 'User'}],
  // I used this for my search filter
  // So I restore it to his default value as enum
  video_type: {type: String, enum: ['MOVIE', 'VIDEO'], default: 'VIDEO', required: true},
  // from vimeo upload result
  type: {type: String}, // can be video/mp4, etc.

  flags: [{inappropriate: Boolean, copyrighted: Boolean, comment: String, user: {type: mongoose.Types.ObjectId, ref: 'User'}}],

  price: {type: Number, default: 0},

  // We must think on how to detect a duplicate video on upload
  // It seems youtube compare pixel and bitrate of their video
  // to the uploaded video so then can check if it is duplicate
  // and they don't display the uploaded video who is duplicate

  // It seems there's a menu Movies in template, do we need to upload movie?
  // may be it's just a link for the movie?

  // view
  current_time: Number,

  // Live video info
  live_status: {type: Boolean, default: false, required: true},
  live_info: {
    // Copied from others api YouTube or Vimeo (just a suggestion)
    start: {type: Date},
    end: {type: Date},
    auto_start: {type: Boolean, required: true, default: false},
    // liveChatEnabled: Boolean,
    status: {type: String, enum: ['LIVE', 'UPCOMMING', 'COMPLETE'], default: 'UPCOMMING', required: true},
    // needed in fronted as the live doesn't have a thumbnail yet (video thumbnail is returned when vimeo upload is finished)
    live_thumbnail: {type: String},
    roomName: {type: String},
	  maxNoPeople:{type: Number, default: 50}
  },

  viewers: [{type: Schema.Types.ObjectId, ref: 'User'}],
  connected_user: [{type: Schema.Types.ObjectId, ref: 'User'}],
  puchased_by_user: [{type: Schema.Types.ObjectId, ref: 'User'}],
  created: {type: Date, required: true, default: () => { return new Date() }},
  modified: Date
});

Video.index({tags: 'text'}); // schema level

module.exports = mongoose.model('Video', Video);
