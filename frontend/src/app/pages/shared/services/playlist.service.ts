import { Injectable } from '@angular/core';

import { ApiService } from '../mock/service';

import { Playlist } from '../models/playlist';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService extends ApiService{

  private playlistUrl = environment.config.API_BASE_URL + '/playlist';

  // getAllPlaylists(): Observable < Playlist[] > {
  //   return this.query('get', this.playlistUrl);
  // }

  getMyPlaylists(): Observable < Playlist[] > {
    return this.query('get', this.playlistUrl + '/mine');
  }

  getChannelPlaylists(channel_id: string): Observable < Playlist[] > {
    return this.query('get', this.playlistUrl + '/byChannel/' + channel_id);
  }

  getChannelPlaylistsWithVideos(channel_id: string): Observable < Playlist[] > {
    return this.query('get', this.playlistUrl + '/byChannelWithVideos/' + channel_id);
  }

  getMyPlaylistsForChannelView(): Observable < Playlist[] > {
    return this.query('get', this.playlistUrl + '/mineForChannelView/');
  }

  createPlaylist(playlist: Playlist): Observable < Playlist > {
    return this.query('post', this.playlistUrl, playlist);
  }

  getPlaylistDetail(id: string): Observable < Playlist > {
    return this.query('get', this.playlistUrl + '/detail/' + id);
  }

  updatePlaylist(playlist: Playlist): Observable < any > {
    return this.query('put', this.playlistUrl, playlist);
  }

  addVideoToPlaylist(playlist_id: string, video_id: string): Observable < any > {
    return this.query('put', this.playlistUrl + '/addVideoToPlaylist', {playlist_id: playlist_id, video_id: video_id});
  }

  removeVideoFromPlaylist(playlist_id: string, video_id: string): Observable < any > {
    return this.query('put', this.playlistUrl + '/removeVideoFromPlaylist', {playlist_id: playlist_id, video_id: video_id});
  }

  updatePlaylistTitleOrChannel(playlist: Playlist): Observable < any > {
    let payload = {};
    payload['_id'] = playlist._id;
    payload['title'] = playlist.title;
    if (playlist.channel) {
      payload['channel'] = playlist.channel._id;
    }
    return this.query('put', this.playlistUrl, payload);
  }

  deletePlaylist(playlist: Playlist): Observable < string > {
    return this.query('delete', this.playlistUrl + '/' + playlist._id);
  }

  addToChannel(playlist_id: String, channel_id: String): Observable < string > {
    return this.query('put', this.playlistUrl + '/addToChannel', {playlist: playlist_id, channel: channel_id});
  }

  removeFeaturedPlaylist(playlist_id: string): Observable < string > {
    return this.query('get', this.playlistUrl + '/removeFeaturedPlaylist/' + playlist_id);
  }

  myPlaylistsForUserAccountPlaylistView(): Observable < Playlist[] > {
    return this.query('get', this.playlistUrl + '/myPlaylistsForUserAccountPlaylistView');
  }

  myPlaylistsForUserAccountPlaylistDetailView(playlist_id: string): Observable < Playlist > {
    return this.query('get', this.playlistUrl + '/myPlaylistsForUserAccountPlaylistDetailView/' + playlist_id);
  }

}
