'use strict';

const CommonApi = require('../component/api');

const InputValidate = require('../component/inputValidate');

const PlaylistLib = require('../lib/PlaylistLib');
const Playlist = require('../models/Playlist');

class PlaylistApi extends CommonApi{

  constructor(){

    super('playlist', Playlist, PlaylistLib, ["create", "update"]);

    this.router.route('/').post(this.createPlaylist);
    this.router.route('/:id').delete(this.remove);
    this.router.route('/detail/:id').get((request, response, next) => {
      this.wrap(this.modelLib.detail, request.params.id, request.decoded, request, next);
    })
    this.router.route('/').put(this.updatePlaylist);

    this.router.route('/mine').get((request, response, next) => {
      this.wrap(this.modelLib.myPlaylists, request.decoded, request, next);
    })

    this.router.route('/byChannel/:channel_id').get((request, response, next) => {
      this.wrap(this.modelLib.byChannel, request.params.channel_id, false, request.decoded, request, next);
    })

    this.router.route('/byChannelWithVideos/:channel_id').get((request, response, next) => {
      this.wrap(this.modelLib.byChannel, request.params.channel_id, true, request.decoded, request, next);
    })

    this.router.route('/addToChannel').put((request, response, next) => {
      this.wrap(this.modelLib.addToChannel, request.body.playlist, request.body.channel, request.decoded, request, next);
    })

    this.router.route('/mineForChannelView').get((request, response, next) => {
      this.wrap(this.modelLib.myPlaylistsForChannelView, request.decoded, request, next);
    })

    this.router.route('/removeFeaturedPlaylist/:playlist_id').get((request, response, next) => {
      this.wrap(this.modelLib.removeFeaturedPlaylist, request.params.playlist_id, request.decoded, request, next);
    })

    this.router.route('/addVideoToPlaylist').put((request, response, next) => {
      this.wrap(this.modelLib.addVideoToPlaylist, request.body, request.decoded, request, next);
    })

    this.router.route('/removeVideoFromPlaylist').put((request, response, next) => {
      this.wrap(this.modelLib.removeVideoFromPlaylist, request.body, request.decoded, request, next);
    })

    this.router.route('/myPlaylistsForUserAccountPlaylistView').get((request, response, next) => {
      this.wrap(this.modelLib.myPlaylistsForUserAccountPlaylistView, request.decoded, request, next);
    })

    this.router.route('/myPlaylistsForUserAccountPlaylistDetailView/:playlist_id').get((request, response, next) => {
      this.wrap(this.modelLib.myPlaylistsForUserAccountPlaylistDetailView, request.params.playlist_id, request.decoded, request, next);
    })
  }

  createPlaylist = (request, response, next) => {

    if(!InputValidate.notNull("playlist.title", request.body.title, request, next))return next();
    this.wrap(this.modelLib.createPlaylist, request.body, request.decoded, request, next);
  }

  updatePlaylist = (request, respose, next) => {

    if(!InputValidate.notNull("playlist._id", request.body._id, request, next))return next();
    this.wrap(this.modelLib.update, request.body, request.decoded, request, next);
  }
}

module.exports = PlaylistApi;
