import { Injectable } from '@angular/core';

import { ApiService } from '../mock/service';

import { Video } from '../models/video';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { unescapeIdentifier } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class VideoService extends ApiService {

  trendingPageSize: number = 20;

  private videoUrl = environment.config.API_BASE_URL + '/video';

  getAllVideos(): Observable < Video[] > {
    return this.query("get", this.videoUrl);
  }
  
  createVideo(video: Video): Observable < Video > {
    let payload = {};
    for(let key in video){
      if(key == 'channel_id' && video['channel_id'] != null){
        payload['channel_id'] = video['channel_id']._id ? video['channel_id']._id : video['channel_id']; // I add condition (Needed for live, live doesn't have a channel yet here so I add/use video['channel_id'])
      }
      else{
        payload[key] = video[key]
      }
    }

    return this.query("post", this.videoUrl, payload);
  }

  getVideoDetail(id: string): Observable < Video > {
    return this.query("get", this.videoUrl + '/id/' + id);
  }

  getVideoMeta(id: string): Observable < Video > {
    return this.query("get", this.videoUrl + '/meta/' + id);
  }

  updateVideo(video: Video): Observable < Video > {

    let payload = {};
    for(let key in video){
      if(key == 'channel_id' && video['channel_id'] != null){
        payload['channel_id'] = video['channel_id']._id ? video['channel_id']._id : video['channel_id'];
      }
      else{
        payload[key] = video[key]
      }
    }
    return this.query("put", this.videoUrl, payload);
  }

  deleteVideo(video: Video): Observable < Video > {
    return this.query("delete", this.videoUrl + '/' + video._id);
  }

  setVideoInactive(video_id: string): Observable < Video > {
    return this.query("get", this.videoUrl + '/setVideoInactive/' + video_id);
  }

  getVideoBySourceId(source_id: string): Observable < Video > {
    return this.query("get", this.videoUrl + '/bySource/' + source_id);
  }

  getPopularVideos(): Observable < Video[] > {
    return this.query("get", this.videoUrl + '/popular');
  }

  getPopularVideosWithSkipOption(skip_option: number, limit_option: number = 20): Observable < Video[] > {
    return this.query("get", this.videoUrl + '/popularWithSkipOption/' + skip_option + '/' + limit_option);
  }

  getTrendingVideos(page: number = 0, page_size: number = this.trendingPageSize): Observable < Video[] > {
    return this.query("get", this.videoUrl + '/trending/' + page + '/' + page_size);
  }

  getMovieVideos(): Observable < Video[] > {
    return this.query("get", this.videoUrl + '/movie');
  }

  getSimilarVideos(video_id: string): Observable < Video[] > {
    return this.query("get", this.videoUrl + '/similar/' + video_id);
  }

  getVideoByFilter(filter: any): Observable < Video[] > {
    return this.query("post", this.videoUrl + '/getVideoByFilter', filter);
  }

  getUserLatestVideo(): Observable < Video[] > {
    return this.query("get", this.videoUrl + '/getUserLastestVideoPublished');
  }

  getUserUploadedVideo(): Observable < Video[] > {
    return this.query("get", this.videoUrl + '/getUserUploadedVideo');
  }

  getUserFavoriteVideos(): Observable < Video[] > {
    return this.query("get", this.videoUrl + '/favorite');
  }

  getChannelFeaturedVideos(channel_id: string, page: number = 0): Observable < Video[] > {
    return this.query("get", this.videoUrl + '/channelFeatured/' + channel_id + '/' + page);
  }

  getChannelRecentVideos(channel_id: string, page: number = 0): Observable < Video[] > {
    return this.query("get", this.videoUrl + '/channelRecent/' + channel_id + '/' + page);
  }

  getChannelPopularVideos(channel_id: string, page: number = 0): Observable < Video[] > {
    return this.query("get", this.videoUrl + '/channelPopular/' + channel_id + '/' + page);
  }

  getChannelVideos(channel_id: string, page: number = 0, pageSize: number = 0): Observable < Video[] > {
    return this.query("get", this.videoUrl + '/channelVideos/' + channel_id + '/' + page + '/' + pageSize);
  }

  getChannelLiveVideos(channel_id: string, page: number = 0): Observable < Video[] > {
    return this.query("get", this.videoUrl + '/channelOfflineVideos/' + channel_id + '/' + page);
  }

  getUserHistory(): Observable < Video[] > {
    return this.query("get", this.videoUrl + '/userHistory/');
  }

  reportPlay(video_id: string): Observable < any > {
    return this.query('get', this.videoUrl + '/reportPlay/' + video_id);
  }

  updatePlayState(video_id: string, current_time: number): Observable < any > {

    const payload = { video: video_id, current_time: current_time };
    return this.query('post', this.videoUrl + '/updatePlayState', payload);
  }

  searchInChannel(channel_id: string, search_term: string, page: number){
    return this.query("get", this.videoUrl + '/searchInChannel/' + channel_id + '/' + search_term + '/' + page);
  }

  flag(video_id: String, flags: any){

    const payload = {video: video_id, flags: flags};
    return this.query('post', this.videoUrl + '/flag', payload);
  }

  checkMyUploadedVideoStatus(source_ids: any): Observable < any > {
    return this.query("post", this.videoUrl + '/checkMyUploadedVideoStatus', source_ids);
  }

  getVideosForCategory(category_id: string, page: number = 0, page_size: number = 8): Observable < Video[] > {
    return this.query("get", this.videoUrl + '/forCategory/' + category_id + '/' + page + '/' + page_size);
  }

  // endpoint for live start here --------------------------------------------------
  getLive(live_id: string): Observable < Video[] > {
    return this.query('get', this.videoUrl + '/getLive/' + live_id);
  }

  getAllLives(): Observable < Video[] > {
    return this.query('get', this.videoUrl + '/getAllLives');
  }

  getChannelCurrentLive(channel_id: string): Observable < Video > {
    return this.query('get', this.videoUrl + '/channelCurrent/' + channel_id);
  }

  getChannelFutureLivesStart(channel_id: string, start_week: Date, end_week: Date): Observable < Video > {
    return this.query('get', this.videoUrl + '/channelFuture/' + channel_id + '/' + start_week + '/' + end_week);
  }

  getUserLive(): Observable < Video[] > {
    return this.query("get", this.videoUrl + '/getUserLive');
  }

  getUserUpcommingAndCurrentLives(): Observable < Video[] > {
    return this.query("get", this.videoUrl + '/getUserUpcommingAndCurrentLives');
  }

  getActualLives(): Observable < Video[] > {
    return this.query('get', this.videoUrl + '/getActualLives');
  }

  getPopularLives(): Observable < Video[] > {
    return this.query('get', this.videoUrl + '/getPopularLives');
  }

  getRecentLives(start: Date, end: Date): Observable < Video[] > {
    return this.query('get', this.videoUrl + '/getRecentLives' + '/' + start + '/' + end);
  }

  getUpcommingLives(start: Date, end: Date, limit: number = 4): Observable < Video[] > {
    return this.query('get', this.videoUrl + '/getUpcommingLives' + '/' + start + '/' + end + '/' + limit);
  }

  getUserUpcommingLives(): Observable < Video[] > {
    return this.query('get', this.videoUrl + '/getUserUpcommingLives');
  }

  endLiveSession(live_id: string): Observable < any > {
    return this.query("get", this.videoUrl + '/endLiveSession/' + live_id);
  }

  startLiveSession(live_id: string): Observable < any > {
    return this.query("get", this.videoUrl + '/startLiveSession/' + live_id);
  }

  liveReportPlay(live_id: string): Observable < any > {
    return this.query("get", this.videoUrl + '/liveReportPlay/' + live_id);
  }

  getSimilarLives(video_id: string): Observable < Video[] > {
    return this.query("get", this.videoUrl + '/similarLives/' + video_id);
  }

  updateViewers(video: Video, viewers: string): Observable < Video > {

    let payload = {live: video._id, viewers: viewers };

    return this.query("post", this.videoUrl + '/updateViewers', payload);
  }

  // new live update
  checkRoom(roomName: string) {
    return this.query("get", this.videoUrl + '/checkRoom/' + roomName  );
  }

  createRoom(roomName: string,maxNoPeople: number) {
    return this.query("post", this.videoUrl + '/createRoom', {roomName: roomName,maxNoPeople: maxNoPeople});
  }

  generateToken(roomName: string) {
    return this.query("get", this.videoUrl + '/generateToken/' + roomName);
  }
  getConnectedUser(roomName: string) {
    return this.query("get", this.videoUrl + '/getConnectedUser/' + roomName);
  }
  // endpoint for live end here --------------------------------------------------
}
