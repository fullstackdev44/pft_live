'use strict'

const request = require('request');
const Vimeo = require('vimeo').Vimeo;
const async = require('async');

const Video = require('../models/Video');
const Event = require('../models/Event');

const credentials = {
  client_id: process.env.VIMEO_CLIENT_ID,
  client_secret: process.env.VIMEO_CLIENT_SECRET,
  access_token: process.env.VIMEO_ACCESS_TOKEN
}

// Fitness account
const client = new Vimeo(
  credentials.client_id,
  credentials.client_secret,
  credentials.access_token
);

const VimeoLib = (function() {

  let exports = {};

	exports.getVideoData = function(video_id, callback){
    client.request({
      method: 'GET',
      path: '/videos/' + video_id
    }, function (error, body, status_code, headers) {

      callback(error, body);
    })
	}

  // Get all project fitness videos from Vimeo
  exports.getAllVideos = function(callback){
    client.request({
      method: 'GET',
      path: '/me/videos'
    }, function (error, body, status_code, headers) {

      callback(error, body);
    })
	}

  // -----------------------------------------------------------
  // Scripts for checking for pending videos uploaded to Vimeo
  // If it is successfully completes (uploaded and transcoded)
  // then, local video data fields are updated accordingly
  // -----------------------------------------------------------
  exports.checkUploadingVideos = function(callback) {

    Video.find({upload_status: "PENDING", active: true, live_status: false})
      .populate("channel_id", "owner")
      .exec((error, data) => {

      if (error){
        return callback(error);
      }

      async.each(data, (video, async_callback) => {

        exports.getVideoData(video.source_id, (vimeo_error, vimeo_data) => {

          if (vimeo_error){
            return async_callback(vimeo_error);
          }

          if (vimeo_data && vimeo_data.upload.status === 'complete' && vimeo_data.transcode.status === 'complete' ) {

            // saving event
            Event.findOne({object: "VIDEO", type: "CREATION", ref: video._id}, (error, event) => {

              if(!error && !event){

                let creation_event = new Event();
                creation_event.object = "VIDEO";
                creation_event.type = "CREATION";
                creation_event.ref = video._id;
                creation_event.groupRef = video.channel_id ? "" + video.channel_id._id : "";
                creation_event.user = video.user_id;
                creation_event.save();
              }
            })

            if (   vimeo_data.pictures && vimeo_data.pictures.uri
                && vimeo_data.duration && vimeo_data.width
                && vimeo_data.height   && vimeo_data.files
                && vimeo_data.files.length > 0 && vimeo_data.files[0].type
            ){
              // updating video datas
              video['upload_status'] = 'COMPLETE';
              video['duration']      = vimeo_data.duration;
              video['width']         = vimeo_data.width;
              video['height']        = vimeo_data.height;
              video['type']          = vimeo_data.files[0].type;

              // last token in pictures.uri: "/videos/375659623/pictures/834495345" is the unique picture id
              // video['thumbnail'] = vimeo_data.pictures.sizes[3].link
              const image = vimeo_data.pictures.uri ? vimeo_data.pictures.uri.replace(vimeo_data.uri + "/pictures/", "") : ""
              video['vimeo'] = {
                picture_id: image,
                video_url_link: vimeo_data.files[0].link // https://player.vimeo.com/external/375659623.hd.mp4?s=39ab9b7b2bf2ae0781a72750be9fbe448cb6bb96&profile_id=164&oauth2_token_id=1266378059
              }

              //video['thumbnail'] = 'https://i.vimeocdn.com/video/'+ image +'_640x360.jpg'
              video['thumbnail'] = vimeo_data.pictures.sizes[3].link
              video.save(async_callback); // mongoose save script
            }
            else {
               async_callback(null, {message: "Still encoding ..." + video.source_id });
            }

          }
          else {
            async_callback(null, {message: "Still uploading ..." + video.source_id });
          }
        })
      },
      (error) => {
        callback(error, {message: "Complete checking vimeo uploading status."});
      });
    });
  }

  // Preparing video upload to get the URL
  // for the upload. The URL will be used in
  // frontend the video.
  exports.getVideoUploadURL = function(video_infos, callback) {
    const headers = {
      'Authorization': 'bearer ' + credentials.access_token,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.vimeo.*+json;version=3.4'
    }

    const body = {
      'upload' : {
        'approach' : 'tus',
        'size' : video_infos.size
      },
      'name': video_infos.name,
      'description': video_infos.description
    };

    const options = {
      url: 'https://api.vimeo.com/me/videos',
      json: true,
      headers: headers,
      body: body
    };

    request.post(options, (err, res, body) => {
        if (err) {
          console.log(err);
          callback(error);
        }
        else{
          console.log(`Status: ${res.statusCode}`);
          //console.log(body);
          callback(null, {status: res.statusCode, body: body});
        }
    });
  }

  // Check logged user video uploaded status
  exports.checkMyUploadedVideoStatus = function(source_ids, callback) {

    Video.find({ source_id: {$in: source_ids} ,upload_status: "PENDING", active: true, live_status: false})
      .populate("channel_id", "owner")
      .exec(function(error, data) {
      if (error){
        return callback(error);
      }

      async.each(data, (video, async_callback) => {

        exports.getVideoData(video.source_id, function(vimeo_error, vimeo_data) {

          if (vimeo_error){
            return async_callback(vimeo_error);
          }

          if (vimeo_data && vimeo_data.upload.status === 'complete' && vimeo_data.transcode.status === 'complete' ) {

            // saving event
            Event.findOne({object: "VIDEO", type: "CREATION", ref: video._id}, (error, event) => {

              if(!error && !event){

                let creation_event = new Event();
                creation_event.object = "VIDEO";
                creation_event.type = "CREATION";
                creation_event.ref = video._id;
                creation_event.groupRef = video.channel_id ? "" + video.channel_id._id : "";
                creation_event.user = video.user_id;
                creation_event.save();
              }
            })

            if (   vimeo_data.pictures && vimeo_data.pictures.uri
                && vimeo_data.duration && vimeo_data.width
                && vimeo_data.height   && vimeo_data.files
                && vimeo_data.files.length > 0 && vimeo_data.files[0].type
            ){
              video['upload_status'] = 'COMPLETE';
              video['duration']      = vimeo_data.duration;
              video['width']         = vimeo_data.width;
              video['height']        = vimeo_data.height;
              video['type']          = vimeo_data.files[0].type;

              // last token in pictures.uri: "/videos/375659623/pictures/834495345" is the unique picture id
              const image = vimeo_data.pictures.uri.replace(vimeo_data.uri + "/pictures/", "")
              video['vimeo'] = {
                picture_id: image,
                video_url_link: vimeo_data.files[0].link // https://player.vimeo.com/external/375659623.hd.mp4?s=39ab9b7b2bf2ae0781a72750be9fbe448cb6bb96&profile_id=164&oauth2_token_id=1266378059
              }

              //video['thumbnail'] = 'https://i.vimeocdn.com/video/'+ image +'_640x360.jpg'
              video['thumbnail'] = vimeo_data.pictures.sizes[3].link

              //console.log(video);
              video.save(async_callback); // mongoose save script
            }
            else {
              async_callback(null, {message: "Still encoding ..." + video.source_id });
            }
          }
          else {
            async_callback(null, {message: "Still uploading ..." + video.source_id });
          }
        })
      },
      (error) => {
        callback(error, {message: "Complete checking vimeo uploading status."});
      });
    });
  }

	return exports;

})();

module.exports = VimeoLib;
