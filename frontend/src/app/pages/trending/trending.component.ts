import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';

import { CommonComponent } from '../shared/mock/component';

import { ChannelService } from '../shared/services/channel.service';
import { VideoService } from '../shared/services/video.service';
import { TokenService } from '../shared/authentication/token.service';
import { UserService } from '../shared/services/user.service';

import { Video } from '../shared/models/video';
import { Channel } from '../shared/models/channel';
import { User } from '../shared/models/user';

declare var $: any;

@Component({
  selector: 'pft-trending',
  templateUrl: './trending.component.html'
})
export class TrendingComponent extends CommonComponent implements OnInit {

  public top_trending_videos: Video[] = [];
  public trending_videos: Video[] = [];
  public trending_channels: Channel[] = [];

  public user: User;
  public user_subscriptions: any[] = [];
  public show_hide_section: boolean[] = [true, true];

  public skip_option: number = 0;
  public show_arrow: boolean;
  public initial_value: boolean = false;

  public video_info = {title: '', description: ''};

  constructor(
    private router: Router,
    private channelService: ChannelService,
    private videoService: VideoService,
    private tokenService: TokenService,
    private userService: UserService,
    private renderer: Renderer2
    ) {
    super();
  }

  ngOnInit() {

    this.initData(this.trending_videos, this.videoService.getTrendingVideos(0, 18), () => {
      this.top_trending_videos = this.trending_videos.splice(0, 2);
      // this.trending_videos = this.trending_videos.splice(0, 4);
    });

    // override by show_more_trending_channel() function
    // this.initData(this.trending_channels, this.channelService.getTrendingChannels());
    this.show_more_trending_channel();

    if(this.tokenService.user && this.tokenService.user._id){
      this.initData(this.user, this.userService.getUserDetailPopulate(this.tokenService.user._id));
    }

    if(this.user){
      this.initData(this.user_subscriptions, this.userService.getSubscriptions());
    }
  }

  isInWatchLater(video_id: string) {

    if(!this.user){
      return false;
    }
    
    return this.user.watch_later_videos.map(current => current._id).indexOf(video_id) > -1;
  }

  isInPurchasedVideo(video_id: string) {

    if(!this.user){
      return false;
    }

    return this.user.purchased_videos.map(current => current._id).indexOf(video_id) > -1;
  }

  removeFromWatchLater(video: Video) {

    if(!this.user){
      return this.router.navigate(['/login']);
    }

    const video_index = this.user.watch_later_videos.map(current => current._id).indexOf(video._id);
    if (video_index > -1) {
      this.user.watch_later_videos.splice(video_index, 1);
      this.userService.updateUser(this.user, ["watch_later_videos"]).subscribe(
        data => {
        }, error => {
          console.log(error);
        }
      );
    }
  }

  // addToWatchLater(video: Video) {
  //   const video_index = this.user.watch_later_videos.map(current => current._id).indexOf(video._id);
  //   if (video_index == -1) {
  //     this.user.watch_later_videos.push(video);
  //     this.initData(null, this.userService.updateUser(this.user, ["watch_later_videos"]));
  //   }
  // }

  addToWatchLater(video: Video) {

    if(!this.user){
      return this.router.navigate(['/login']);
    }

    if (!this.user.watch_later_videos){
      this.user.watch_later_videos = [];
    }
    if (this.user.watch_later_videos.map(current => current._id.toString()).indexOf(video._id.toString()) == -1) {

      this.user.watch_later_videos.push(video);
      this.initData(null, this.userService.updateUser(this.user, ["watch_later_videos"]));
    }
  }

  userIsSubscribedTo(channel_id: string){

    if(!this.user){
      return false
    }

    return this.user_subscriptions.map(current => current._id).indexOf(channel_id) > -1;
  }

  show_more_trending_channel() {
    // this.channelService.getTrendingChannelsWithSkipOption(this.skip_option).subscribe(
    this.channelService.getTrendingChannelsWithSkipOption(this.skip_option, 18).subscribe(
      data => {

        data.length > 0 ? this.show_arrow = true : this.show_arrow = false ;

        if (this.initial_value == false) {
          data.length >= 6 ? this.show_arrow = true : this.show_arrow = false ;
          this.initial_value = true;
        }

        this.trending_channels = this.trending_channels.concat(data);
        this.skip_option += 1;
      }, error => {
        console.log(error);
    });
  }

  showVideoInfoModal(video: Video){

    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    $("#video_info_modal").addClass("opened");
    $("#video_info_form").addClass("show");
    this.video_info.title = video.title;
    this.video_info.description = video.description;
  }

  hideVideoInfoModal(){

    this.renderer.removeClass(document.body, 'overlay');
    $("#video_info_modal").removeClass("opened");
    $("#video_info_form").removeClass("show");
    this.video_info.title = '';
    this.video_info.description = '';
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if($('.form_popup.opened').length > 0 || $('.login_form.show').length > 0) {
      if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');
      } else { this.renderer.removeClass(document.body, 'overlay'); }
    }
  }
}
