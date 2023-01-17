import { Component, OnInit, Renderer2, HostListener, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { CommonComponent } from '../shared/mock/component';

import { ChannelService } from '../shared/services/channel.service';
import { VideoService } from '../shared/services/video.service';
import { TokenService } from '../shared/authentication/token.service';
import { UserService } from '../shared/services/user.service';
import { VimeoService } from '../shared/services/vimeo.service';

import { Video } from '../shared/models/video';
import { Channel } from '../shared/models/channel';
import { User } from '../shared/models/user';

declare var $: any;

@Component({
  selector: 'pft-home',
  templateUrl: './home.component.html'
})
export class HomeComponent extends CommonComponent implements OnInit, OnDestroy {

  public popular_videos: any[] = [];
  public popular_channels: Channel[] = [];
  public updates_from_subs: any = {};
  public recommended_videos: Video[] = [];
  public trending_videos: Video[] = [];

  public user: User = new User();
  public user_subscriptions: any[] = [];
  public show_hide_section: boolean[] = [true, true, true, true, true, true, true, true];
  public skip_option = 0;
  private popular_limit_option: number = 8;
  public show_arrow: any[] = [];

  // config
  private watchLaterMaxLength: number = 8;

  public video_info = {title: '', description: ''};

  public upcomming_lives: Video[] = [];
  public interval_live_event_id: number

  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private channelService: ChannelService,
    private videoService: VideoService,
    private vimeoService: VimeoService,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2
  ) {
    super();
  }

  ngOnInit() {

    if(this.tokenService.user && this.tokenService.user._id){

      this.userService.getUserDetailPopulate(this.tokenService.user._id).subscribe(
        data => {

          this.user = data;

          if (this.user && this.user._id) {

            this.initData(this.user_subscriptions, this.userService.getSubscriptions());
            this.userService.getUpdatesFromSubscriptions().subscribe(data => {
              this.updates_from_subs = data;
            })
            this.initData(this.recommended_videos, this.userService.getRecommendedVideos());
            this.user.watch_later_videos = [];
            this.initData(this.user.watch_later_videos, this.userService.getWatchLaterVideos());
            this.user.continue_watching_videos = [];
            this.initData(this.user.continue_watching_videos, this.userService.getContinueWatchingVideos());
          }

        }, error => {
          console.log(error);
        }
      );
    }
      
    // testing to activate show more button just for home page
    this.show_more_popular_videos();

    /*this.initData(this.popular_videos, this.videoService.getPopularVideos(), () => {
      this.popular_videos.map(current => {
        const video_url = current.vimeo ? current.vimeo.video_url_link : null;
        current.ssafe_video_url = video_url ? this.sanitizer.bypassSecurityTrustResourceUrl(video_url) : null;
      })
    });*/

    this.initData(this.popular_channels, this.channelService.getPopularChannels(),() => {
      // this.popular_channels = this.shuffleArray(this.popular_channels);
    });
    this.initData(this.trending_videos, this.videoService.getTrendingVideos(0, 8));

    // live
    this.getUpcomingLive();
    setInterval(() => {
      this.getUpcomingLive();
    }, 60000);
  }

  userIsSubscribedTo(channel_id: string){
    return this.user_subscriptions.map(current => current._id).indexOf(channel_id) > -1;
  }

  addToWatchLater(video: Video) {

    if (!this.user.watch_later_videos){
      this.user.watch_later_videos = [];
    }

    if (this.user.watch_later_videos.map(current => current._id.toString()).indexOf(video._id.toString()) == -1) {

      if(this.user.watch_later_videos.length == this.watchLaterMaxLength){
        this.user.watch_later_videos.shift();
      }
    
      this.user.watch_later_videos.push(video);
      this.initData(null, this.userService.updateUser(this.user, ["watch_later_videos"]));
    }
  }

  isInWatchLater(video_id: string) {
    return this.user.watch_later_videos.map(current => current._id).indexOf(video_id) > -1;
  }

  isInPurchasedVideo(video_id: string) {
    return this.user.purchased_videos.map(current => current._id).indexOf(video_id) > -1;
  }

  removeFromWatchLater(video: Video) {
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

  show_more_popular_videos() {
    this.videoService.getPopularVideosWithSkipOption(this.skip_option, this.popular_limit_option).subscribe(
      data => {
        
        data.length > 0 ? this.show_arrow[3] = true : this.show_arrow[3] = false ;
        this.popular_videos = this.popular_videos.concat(data);
        // this.popular_videos = this.shuffleArray(this.popular_videos);
        this.popular_videos.map(current => {
          const video_url = current.vimeo ? current.vimeo.video_url_link : null;
          current.ssafe_video_url = video_url ? this.sanitizer.bypassSecurityTrustResourceUrl(video_url) : null;
        });
        this.skip_option += 8;
      }, error => {
        console.log(error);
    });
  }

  shuffleArray(arra1: any) {
    let ctr = arra1.length, temp, index;
    while (ctr > 0) {
      index = Math.floor(Math.random() * ctr);
      ctr--;
      temp = arra1[ctr];
      arra1[ctr] = arra1[index];
      arra1[index] = temp;
    }
    return arra1;
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

  getUpcomingLive() {
    var curr_upcomming = new Date;
    var start_upcomming = new Date();
    var end_upcomming = new Date(curr_upcomming.setDate(curr_upcomming.getDate() + 2));
    end_upcomming.setHours(23, 59, 59);

    this.videoService.getUpcommingLives(start_upcomming, end_upcomming, 8).subscribe(
      data => {
        this.upcomming_lives = data;
      }, error => {
        if(this.interval_live_event_id) {
          clearInterval(this.interval_live_event_id);
        }
      });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if($('.form_popup.opened').length > 0 || $('.login_form.show').length > 0) {
      if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');
      } else { this.renderer.removeClass(document.body, 'overlay'); }
    }
  }

  ngOnDestroy() {
    if (this.interval_live_event_id) {
      clearInterval(this.interval_live_event_id);
    }
  }
}
