import { Injectable } from '@angular/core';

import { ApiService } from '../mock/service';

import { User } from '../models/user';
import { Channel } from '../models/channel';
import { Video } from '../models/video';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService extends ApiService {

  private userUrl = environment.config.API_BASE_URL + '/user';

  // public: data shared by components
  public paused_video: Video = null;

  updatesPageSize: number = 4;

  getAllUsers(): Observable < User[] > {
    return this.query('get', this.userUrl);
  }

  getConnected(): Observable < User > {
    return this.query('get', this.userUrl + "/connected");
  }

  getByChannel(channel_id: string): Observable < User > {
    return this.query('get', this.userUrl + "/byChannel/" + channel_id);
  }

  createUser(user: User): Observable < string > {
    return this.query('post', this.userUrl + '/', user);
  }

  checkAndUpdatePassword(params: any): Observable < string > {
    return this.query('post', this.userUrl + '/checkAndUpdatePassword', params);
  }

  getUserDetail(id: string): Observable < User > {
    return this.query('get', this.userUrl + '/id/' + id);
  }

  queryUser(id: string, fields: string[] = [], population: string[] = []): Observable < User > {
    const query = { fields: fields, population: population };
    return this.query('post', this.userUrl + '/query/' + id , query);
  }

  queryUsers(conditions: any = null, fields: string[] = [], population: string[] = []): Observable < User > {
    const query = { conditions: conditions, fields: fields, population: population };
    return this.query('post', this.userUrl + '/query', query);
  }

  getUserDetailPopulate(id: string): Observable < User > {
    return this.query('get', this.userUrl + '/detailPopulate/' + id);
  }

  getUserPurchasedVideo(id: string): Observable < User > {
    return this.query('get', this.userUrl + '/getUserPurchasedVideo/' + id);
  }

  getUserDetailNoPopulate(id: string): Observable < User > {
    return this.query('get', this.userUrl + '/detailNoPopulate/' + id);
  }

  getUpdatesFromSubscriptions(): Observable < any > {
    return this.query("get", this.userUrl + '/updatesFromSubscription');
  }

  getUpdatesFromSubscriptionsDetail(page: number = 0, page_size: number = this.updatesPageSize): Observable < any > {
    return this.query("get", this.userUrl + '/updatesFromSubscriptionsDetail/' + page + '/' + page_size);
  }

  updateUser(user: User, params: Array<string> = []): Observable < string > {

    let payload = {_id: user._id};

    if(params.length){
      for(let param in params){
        payload[params[param]] = user[params[param]];
      }
    }
    else{
      payload = user;
    }

    // console.log(payload);

    return this.query('put', this.userUrl, payload);
  }

  updateUserVideoHistory(user: User): Observable < string > {

    let payload = {_id: user._id};

    if(user.videos_history && user.videos_history.length){
      payload['videos_history'] = user.videos_history.map(current => current._id);
    }

    return this.query('put', this.userUrl, payload);
  }


  deleteUser(user: User): Observable < string > {
    return this.query('delete', this.userUrl + '/' + user._id);
  }

  signUp(user: User): Observable < any > {
    return this.query('post', this.userUrl + '/signup', user);
  }

  registerUserFromSocialNetwork(user: User): Observable < any > {
    return this.query('post', this.userUrl + '/registerUserFromSocialNetwork', user);
  }

  forgotPassword(param: any): Observable < any > {
    return this.query('post', this.userUrl + '/forgotPassword', param);
  }

  resetPassword(param: any): Observable < any > {
    return this.query('post', this.userUrl + '/resetPassword', param);
  }

  activateAccount(param: any): Observable < any > {
    return this.query('post', this.userUrl + '/activateAccount', param);
  }

  getChannelRecentDonators(channel_id: string): Observable < User[] > {
    return this.query('get', this.userUrl + '/channelRecentDonators/' + channel_id);
  }

  getUserSearchHistory(): Observable < User[] > {
    return this.query('get', this.userUrl + '/searchHistory/');
  }

  getSubscriptions(): Observable < Channel[] > {
    return this.query('get', this.userUrl + '/subscriptions');
  }

  getSubscriptionsbyid(user_id: string,channel_id: string): Observable < Channel[] > {
    return this.query('get', this.userUrl + '/subscriptionsbyid/' + user_id + '/' + channel_id);
  }

  subscribe(channel_id: string): Observable < string > {
    return this.query('get', this.userUrl + '/subscribe/' + channel_id);
  }

  unsubscribe(channel_id: string): Observable < string > {
    return this.query('get', this.userUrl + '/unsubscribe/' + channel_id);
  }

  addToFavorite(video_id: string): Observable < string > {
    return this.query('get', this.userUrl + '/addToFavorite/' + video_id);
  }

  removeFromFavorite(video_id: string): Observable < string > {
    return this.query('get', this.userUrl + '/removeFromFavorite/' + video_id);
  }

  addToWatchLater(video_id: string): Observable < string > {
    return this.query('get', this.userUrl + '/addToWatchLater/' + video_id);
  }

  removeFromWatchLater(video_id: string): Observable < string > {
    return this.query('get', this.userUrl + '/removeFromWatchLater/' + video_id);
  }

  getNotificationsConfig(): Observable < any[] > {
    return this.query('get', this.userUrl + '/notificationsConfig');
  }

  getLastPausedVideo() {
    this.query('get', this.userUrl + '/lastPausedVideo').subscribe(data => {
      this.paused_video = data.video;
      if(this.paused_video){
        this.paused_video.current_time = data.current_time;
      }
    })
  }

  getChannelByOwner(): Observable < Channel[] > {
    return this.query('get', this.userUrl + '/myChannels');
  }

  getRecommendedVideos(): Observable < Video[] > {
    return this.query("get", this.userUrl + '/recommended');
  }

  getWatchLaterVideos(page: number = 0): Observable < Video[] > {
    return this.query("get", this.userUrl + '/watchLater' + '/' + page);
  }

  getContinueWatchingVideos(page: number = 0): Observable < Video[] > {
    return this.query("get", this.userUrl + '/continueWatching' + '/' + page);
  }

  removeFromUpdatesFromSubscriptions(channel_id: string) {
    return this.query("get", this.userUrl + '/removeFromUpdatesFromSubscriptions/' + channel_id);
  }
}
