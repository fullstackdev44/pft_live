'use strict';

const CommonLib = require('../component/lib');

const Playlist = require('../models/Playlist');

class PlaylistLib extends CommonLib{

  constructor(){
    super(Playlist);
  }

  createPlaylist = (data, decoded, callback) => {

  	data.owner = decoded._id;
  	this._create(data, decoded, callback);
  }

  myPlaylists = (decoded, callback) => {

    // Remove __v to resolve an update error (really needed)
    Playlist.find({owner: decoded._id}, '-__v')
    .populate(
      {
        path: 'owner'
      }
    )
    .populate(
      {
        path: 'videos',
        populate: {path: 'channel_id'}
      }
    )
    .sort({'created': -1})
    .exec(callback);

  }

  myPlaylistsForChannelView = (decoded, callback) => {

    // Remove __v to resolve an update error (really needed)
    Playlist.find({owner: decoded._id}, '-__v')
    .populate(
      {
        path: 'owner'
      }
    )
    .populate(
      {
        path: 'videos',
        populate: {path: 'channel_id'}
      }
    )
    .sort({'created': -1})
    .exec((error, playlists) => {

      if(error){
        return callback(error);
      }

      // limit video numbers
      playlists = playlists.map(current => {

        current.videos = current.videos.slice(0, 4);
        return current;
      })

      callback(null, playlists);
    });

  }

  detail = (playlist_id ,decoded, callback) => {
    // Remove __v to resolve an update error (really needed)
    Playlist.findById(playlist_id, '-__v')
    .populate(
      {
        path: 'videos',
        populate: {path: 'channel_id'}
      }
    )
    .populate('channel')
    .exec(callback);

  }

  update = ( data, decoded, callback) => {

    Playlist.findById(data._id, '-__v').exec((err, playlist) => {

      delete data._id;
      data.checked ? delete data.checked : '';

      for (const key in data) {
        if ({}.hasOwnProperty.call(data, key)) {
          playlist[key] = data[key];
        }
      }

      if(!data.channel && data.channel == undefined) {
        playlist.channel = undefined;
      }

      playlist.save(callback);
    });
  }

  byChannel(channel_id, with_videos=false, decoded, callback){

  	Playlist.find({channel: channel_id})
    // .populate(with_videos ? "videos" : "")
    .populate({
      path: 'videos',
      populate: {
        path: 'channel_id',
        select: 'title'
      }
    })
    .sort({"created": -1})
    .exec((error, playlists) => {

      if(error){
        return callback(error);
      }

      // limit video numbers
      playlists = playlists.map(current => {

        current.videos = current.videos.slice(0, 4);
        return current;
      })

      callback(null, playlists);
    });
  }

  addToChannel(playlist_id, channel_id, decoded, callback){

    Playlist.findById(playlist_id, {channel: true}, (error, playlist) => {

      if(error){
        return callback(error);
      }

      if(!playlist){
        return callback({type: "NotFound"});
      }

      playlist.channel = channel_id;

      playlist.save((err, saved) => {
        if (err) {
          callback(err);
        }

        callback(null, 'done');
      });

    })
  }

  removeFeaturedPlaylist(playlist_id, decoded, callback){

    Playlist.findById(playlist_id)
    .exec((error, playlist) => {

      if(error){
        return callback(error);
      }

      if(!playlist){
        return callback({type: "NotFound"});
      }

      playlist.channel = null;

      playlist.save((err, saved) => {
        if (err) {
          callback(err);
        }

        callback(null, 'done');
      });
    });
  }

  addVideoToPlaylist(data, decoded, callback){

    Playlist.findById(data.playlist_id, {videos: true}, (error, playlist) => {

      if(error){
        return callback(error);
      }

      if(!playlist){
        return callback({type: "NotFound"});
      }

      if(!playlist.videos) playlist.videos = [];

      let video_index = playlist.videos.map(current => current._id).indexOf(data.video_id);
      if (video_index > -1) return callback(null, 'already_exist');

      playlist.videos.push(data.video_id);

      playlist.save((err, saved) => {
        if (err) {
          callback(err);
        }

        callback(null, 'done');
      });

    })
  }

  removeVideoFromPlaylist(data, decoded, callback){

    Playlist.findById(data.playlist_id, {videos: true}, (error, playlist) => {

      if(error){
        return callback(error);
      }

      if(!playlist){
        return callback({type: "NotFound"});
      }

      if(playlist.videos && playlist.videos.length > 0) {
        let video_index = playlist.videos.map(current => current._id).indexOf(data.video_id);
        if (video_index > -1) playlist.videos.splice(video_index, 1);
      }

      playlist.save((err, saved) => {
        if (err) {
          callback(err);
        }

        callback(null, 'done');
      });

    })
  }

  myPlaylistsForUserAccountPlaylistView = (decoded, callback) => {

    // Remove __v to resolve an update error (really needed)
    Playlist.find({owner: decoded._id}, '-__v')
    .populate('videos', 'thumbnail')
    .sort({'created': -1})
    .exec((error, playlists) => {

      if(error){
        return callback(error);
      }

      callback(null, playlists);
    });

  }

  myPlaylistsForUserAccountPlaylistDetailView = (playlist_id, decoded, callback) => {

    // Remove __v to resolve an update error (really needed)
    Playlist.findById(playlist_id, '-__v')
    .populate(
      {
        path: 'videos',
        select: 'source_id thumbnail duration price title meta channel_id description',
        populate: {
         path: 'channel_id',
         select: 'title'
        }
      }
    )
    .populate('channel')
    .exec(callback);
  }

}

module.exports = PlaylistLib;
