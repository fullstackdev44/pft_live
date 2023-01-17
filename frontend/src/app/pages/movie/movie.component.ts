import { Component, OnInit, Renderer2, HostListener } from '@angular/core';

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
  selector: 'pft-movie',
  templateUrl: './movie.component.html'
})
export class MovieComponent extends CommonComponent implements OnInit {

  public top_movie: Video;
  public movie_videos: Video[] = [];
  public movie_channels: Channel[] = [];
  public user: User = new User();

  public video_info = {title: '', description: ''};

  constructor(private channelService:ChannelService,
    private videoService: VideoService,
    private tokenService: TokenService,
    private userService: UserService,
    private renderer: Renderer2  
  ) {
    super();
  }

  ngOnInit() {

    this.initData(this.movie_videos, this.videoService.getMovieVideos(), () => {
      this.top_movie = this.movie_videos.slice(0, 1)[0];
      this.movie_videos.splice(0, 1);
    });

    this.initData(this.movie_channels, this.channelService.getMovieChannels());

    if(this.tokenService.user && this.tokenService.user._id){
      this.initData(this.user, this.userService.getUserDetailPopulate(this.tokenService.user._id));
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

  addToWatchLater(video: Video) {
    const video_index = this.user.watch_later_videos.map(current => current._id).indexOf(video._id);
    if (video_index == -1) {
      this.user.watch_later_videos.push(video);
      this.initData(null, this.userService.updateUser(this.user, ["watch_later_videos"]));
    }
  }

  watchlater(video: Video){
    
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
