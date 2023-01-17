import { Component, OnInit, Renderer2, HostListener } from '@angular/core';

import { CommonComponent } from '../shared/mock/component';

import { ChannelService } from '../shared/services/channel.service';
import { VideoService } from '../shared/services/video.service';
import { TokenService } from '../shared/authentication/token.service';
import { UserService } from '../shared/services/user.service';

import { Video } from '../shared/models/video';
import { Channel } from '../shared/models/channel';
import { User } from '../shared/models/user';
import { DomSanitizer } from '@angular/platform-browser';

declare var $: any;

@Component({
  selector: 'pft-popular',
  templateUrl: './popular.component.html'
})
export class PopularComponent extends CommonComponent implements OnInit {

  public popular_videos: any[] = [];
  public popular_channels: Channel[] = [];
  public user: User = new User();
  public user_subscriptions: any[] = [];
  public show_hide_section: boolean[] = [true, true];
  public show_arrow: any[] = [];
  public skip_option: number[] = [0, 0];
  private initial_value: boolean[] = [false/*, false*/];

  public video_info = {title: '', description: ''};

  constructor(private channelService: ChannelService,
    private videoService: VideoService,
    private tokenService: TokenService,
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2
  ) {
    super();
  }

  ngOnInit() {
    // override by those show_more() function
    /*this.initData(this.popular_videos, this.videoService.getPopularVideos());
    this.initData(this.popular_channels, this.channelService.getPopularChannels());*/

    // this.show_more_popular_videos();
    // this.show_more_popular_channel();
    this.show_more();

    this.tokenService.decodeUserToken();

    if(this.tokenService.user){
      this.initData(this.user_subscriptions, this.userService.getSubscriptions());
      this.initData(this.user, this.userService.getUserDetailPopulate(this.tokenService.user._id));
    }
  }

  userIsSubscribedTo(channel_id: string){
    return this.user_subscriptions.map(current => current._id).indexOf(channel_id) > -1;
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

  addToWatchLater(video: Video) {
    const video_index = this.user.watch_later_videos.map(current => current._id).indexOf(video._id);
    if (video_index == -1) {
      this.user.watch_later_videos.push(video);
      this.initData(null, this.userService.updateUser(this.user, ["watch_later_videos"]));
    }
  }

  /*show_more_popular_videos() {
    this.videoService.getPopularVideosWithSkipOption(this.skip_option[0]).subscribe(
      data => {
        data.length > 0 ? this.show_arrow[0] = true : this.show_arrow[0] = false ;
        if (this.initial_value[0] == false) {
          data.length >= 8 ? this.show_arrow[0] = true : this.show_arrow[0] = false ;
          this.initial_value[0] = true;
        }
        this.popular_videos = this.popular_videos.concat(data);
        this.popular_videos.map(current => {
          const video_url = current.vimeo ? current.vimeo.video_url_link : null;
          current.ssafe_video_url = video_url ? this.sanitizer.bypassSecurityTrustResourceUrl(video_url) : null;
        });
        this.skip_option[0] += 8;
      }, error => {
        console.log(error);
    });
  }

  show_more_popular_channel() {
    this.channelService.getPopularChannelsWithSkipOption(this.skip_option[1], 12).subscribe(
      data => {
        data.length > 0 ? this.show_arrow[1] = true : this.show_arrow[1] = false ;
        if (this.initial_value[1] == false) {
          data.length >= 12 ? this.show_arrow[1] = true : this.show_arrow[1] = false ;
          this.initial_value[1] = true;
        }
        this.popular_channels = this.popular_channels.concat(data);
        this.skip_option[1] += 12;
      }, error => {
        console.log(error);
    });
  }*/
  
  show_more() {
    // this.videoService.getPopularVideosWithSkipOption(this.skip_option[0]).subscribe(
    this.videoService.getPopularVideosWithSkipOption(this.skip_option[0], 20).subscribe(
      data_videos => {

        // this.channelService.getPopularChannelsWithSkipOption(this.skip_option[1], 6).subscribe(
        this.channelService.getPopularChannelsWithSkipOption(this.skip_option[1], 18).subscribe(
          data_channels => {

            (data_videos.length > 0 || data_channels.length > 0 ) ? this.show_arrow[0] = true : this.show_arrow[0] = false ;
            if (this.initial_value[0] == false) {
              data_videos.length >= 20 || data_channels.length >= 6 ? this.show_arrow[0] = true : this.show_arrow[0] = false ;
              this.initial_value[0] = true;
            }
            this.popular_videos = this.popular_videos.concat(data_videos);
            this.popular_videos.map(current => {
              const video_url = current.vimeo ? current.vimeo.video_url_link : null;
              current.ssafe_video_url = video_url ? this.sanitizer.bypassSecurityTrustResourceUrl(video_url) : null;
            });
            this.skip_option[0] += 20;

            this.popular_channels = this.popular_channels.concat(data_channels);
            this.skip_option[1] += 6;

          }, error => {
            console.log(error);
        });

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
