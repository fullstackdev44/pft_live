import { Injectable } from '@angular/core';

import { ApiService } from '../mock/service';

import { Channel } from '../models/channel';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChannelService extends ApiService{

  private channelUrl = environment.config.API_BASE_URL + '/channel';

  // duplicate of getChannelDetail
  getById(id: string): Observable < Channel > {
    return this.query("get", this.channelUrl + '/id/' + id);
  }

  getAllChannels(): Observable < Channel[] > {
    return this.query("get", this.channelUrl);
  }

  getMyChannels(): Observable < Channel[] > {
    return this.query("get", this.channelUrl + '/mine');
  }

  getChannelFeaturedChannels(channel_id: string): Observable < Channel[] > {
    return this.query("get", this.channelUrl + '/featured/' + channel_id);
  }

  getPopularChannels(): Observable < Channel[] > {
    return this.query("get", this.channelUrl + '/popular');
  }

  getPopularChannelsWithSkipOption(skip_option: number, limit_option: number = 18): Observable < Channel[] > {
    return this.query("get", this.channelUrl + '/popularWithSkipOption/' + skip_option + '/' + limit_option);
  }

  getTrendingChannels(): Observable < Channel[] > {
    return this.query("get", this.channelUrl + '/trending');
  }

  getTrendingChannelsWithSkipOption(skip_option: number, limit_option: number): Observable < Channel[] > {
    return this.query("get", this.channelUrl + '/trendingWithSkipOption/' + skip_option + '/' + limit_option);
  }

  getMovieChannels(): Observable < Channel[] > {
    return this.query("get", this.channelUrl + '/movie');
  }

  getRecentChannels(): Observable < Channel[] > {
    return this.query("get", this.channelUrl + '/recent');
  }

  getRecentChannelsWithSkipOption(skip_option: number, limit_option: number): Observable < Channel[] > {
    return this.query("get", this.channelUrl + '/recentWithSkipOption/' + skip_option + '/' + limit_option);
  }

  createChannel(channel: Channel): Observable < string > {
    return this.query("post", this.channelUrl, channel);
  }

  getChannelDetail(id: string): Observable < Channel > {
    return this.query("get", this.channelUrl + '/id/' + id);
  }

  // reportView(channel_id: string): Observable < string > {
  //   return this.query("put", this.channelUrl + '/reportView', {_id: channel_id});
  // }

  updateChannel(channel: Channel): Observable < string > {
    return this.query("put", this.channelUrl, channel);
  }

  updateProfileImage(channel: Channel): Observable < string > {
    const payload = {
      _id: channel._id,
      profile_image: channel.profile_image,
      profile_image_offset: channel.profile_image_offset,
      profile_image_height: channel.profile_image_height,
      profile_image_width: channel.profile_image_width
    }

    return this.query('put', this.channelUrl, payload);
  }

  updateProfileImagePosition(channel: Channel): Observable < string > {
    const payload = {
      _id: channel._id,
      profile_image_offset: channel.profile_image_offset
    }

    return this.query('put', this.channelUrl, payload);
  }

  updateTitle(channel: Channel): Observable < string > {
    const payload = {_id: channel._id, title: channel.title};
    return this.query('put', this.channelUrl + '/updateTitle', payload);
  }

  updateDetail(channel: Channel): Observable < string > {
    const payload = {_id: channel._id, detail: channel.detail};
    return this.query('put', this.channelUrl, payload);
  }

  updateVideoCount(channel: Channel): Observable < string > {
    const payload = {_id: channel._id, meta: channel.meta};
    return this.query('put', this.channelUrl + '/updateVideoCount', payload);
  }

  updateLinks(channel: Channel): Observable < string > {

    // format links
    channel.links.map(current => {
      if(!current.url.startsWith("http://") && !current.url.startsWith("https://")) {
        current.url = "http://" + current.url;
      }
    })

    console.log(channel.links);

    const payload = {_id: channel._id, links: channel.links};
    return this.query('put', this.channelUrl, payload);
  }

  updateInquiries(channel: Channel): Observable < string > {

    // format links
    channel.business_inquiries.map(current => {
      if(!current.url.startsWith("mailto:")) {
        current.url = "mailto:" + current.url;
      }
    })
    const payload = {_id: channel._id, business_inquiries: channel.business_inquiries};
    return this.query('put', this.channelUrl, payload);
  }

  updateFeaturedProducts(channel: Channel): Observable < string > {
    const payload = {_id: channel._id, featured_products: channel.featured_products};
    return this.query('put', this.channelUrl, payload);
  }

  deleteChannel(channel: Channel): Observable < string > {
    return this.query('delete', this.channelUrl + '/' + channel._id);
  }

  getChannelByCategory(category: any): Observable < Channel[] > {
    return this.query('get', this.channelUrl + '/byCategory/' + category._id);
  }

  getChannelByCategories(category_ids: string[]): Observable < Channel[] > {
    return this.query('post', this.channelUrl + '/byCategories', category_ids);
  }

  getLiveChannels(): Observable < Channel[] > {
    return this.query('get', this.channelUrl + '/live');
  }

  getSubscribedChannels(): Observable < Channel[] > {
    return this.query('get', this.channelUrl + '/subscribed');
  }

  addFeaturedVideo(channel_id: String, video_id: String){
    return this.query('put', this.channelUrl + '/addFeaturedVideo', {channel: channel_id, video: video_id});
  }

  removeFeaturedVideo(channel_id: String, video_id: String){
    return this.query('put', this.channelUrl + '/removeFeaturedVideo', {channel: channel_id, video: video_id});
  }

  addFeaturedChannel(channel_id: String, feature_channel_id: String){
    return this.query('put', this.channelUrl + '/addFeaturedChannel', {channel: channel_id, feature_channel: feature_channel_id});
  }

  removeFeaturedChannel(channel_id: String, feature_channel_id: String){
    return this.query('put', this.channelUrl + '/removeFeaturedChannel', {channel: channel_id, feature_channel: feature_channel_id});
  }

  flag(channel_id: String, flags: any){

    const payload = {channel: channel_id, flags: flags};
    return this.query('post', this.channelUrl + '/flag', payload);
  }

  videoCount(channel_id: string): Observable < any > {
    return this.query("get", this.channelUrl + '/videoCount/' + channel_id);
  }

  checkChannelOfUser(user_id: string): Observable < string > {
    return this.query("get", this.channelUrl + '/checkChannelOfUser/' + user_id);
  }


}
