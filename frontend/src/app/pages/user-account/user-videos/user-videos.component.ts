import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { Router } from '@angular/router';

import { CommonComponent } from '../../shared/mock/component';

import { VideoService } from '../../shared/services/video.service';
import { UserService } from '../../shared/services/user.service';
import { ChannelService } from '../../shared/services/channel.service';
import { TokenService } from '../../shared/authentication/token.service';

import { Video } from '../../shared/models/video';
import { Channel } from '../../shared/models/channel';
import { User } from '../../shared/models/user';
import { PlaylistService } from '../../shared/services/playlist.service';
import { Playlist } from '../../shared/models/playlist';

declare var $: any;

@Component({
  selector: 'pft-user-videos',
  templateUrl: './user-videos.component.html'
})
export class UserVideosComponent extends CommonComponent implements OnInit {

  public user: User = new User();
  public default_channel: Channel = null;
  public uploaded_videos: Video[] = [];
  public featured_videos: Video[] = [];
  public video_to_be_deleted: Video;
  public index: number;
  public playlists: any[] = [];
  public add_to_playlist: boolean = undefined;
  public loading: boolean = false;
  public featured_videos_length: number = 0;

  public video_info = {title: '', description: ''};

  constructor(
    private videoService: VideoService,
    private userService: UserService,
    private channelService: ChannelService,
    private renderer: Renderer2,
    private tokenService: TokenService,
    private playlistService: PlaylistService,
    private router: Router
  ) {
    super();
  }

  ngOnInit() {

    // this.initData(this.user, this.userService.getUserUploadedVideo());
    this.initData(this.uploaded_videos, this.videoService.getUserUploadedVideo(), () => {
      this.initData(this.user, this.userService.getConnected(), () => {
        this.initData(this.playlists, this.playlistService.getMyPlaylists());

        let user_channels = [];
        this.initData(user_channels, this.channelService.getMyChannels(), () => {

          // default user channel
          if(user_channels.length > 0){

            console.log(user_channels);

            this.default_channel = user_channels[0];
            this.initData(this.featured_videos, this.videoService.getChannelFeaturedVideos(this.default_channel._id), () => {
              this.featured_videos_length = this.featured_videos.length;
              const featured_videos_ids = this.featured_videos.map(current => current._id);

              this.uploaded_videos.map(current => {
                  current.featured = featured_videos_ids.indexOf(current._id) > -1;
              })
            })
          }
        })
      })
    })
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
        })
    }
  }

  addToWatchLater(video: Video) {
    const video_index = this.user.watch_later_videos.map(current => current._id).indexOf(video._id);
    if (video_index == -1) {
      this.user.watch_later_videos.push(video);
      this.initData(null, this.userService.updateUser(this.user, ["watch_later_videos"]));
    }
  }

  removeVideo() {
    this.loading = true;
    this.uploaded_videos.splice(this.index, 1);
    this.videoService.setVideoInactive(this.video_to_be_deleted._id).subscribe(
      data => {
        this.loading = false;
        this.index = undefined;
        if(this.userService.paused_video && this.userService.paused_video._id == this.video_to_be_deleted._id) {
          this.userService.getLastPausedVideo();
        }
        this.video_to_be_deleted = undefined;
        this.hideConfirmationModal();
      }, error => {
        console.log(error);
      })
  }

  addFeature(video: Video){
    if (this.featured_videos_length <= 1) {
      video.featured = true;
      this.initData(null, this.channelService.addFeaturedVideo(this.default_channel._id, video._id), () => {
        this.featured_videos_length += 1;
      });
    } else {
      $("#add_flag_modal").addClass("opened");
      $("#add_flag_form").addClass("show");
    }
  }

  hideFeatureMessageModal() {
    this.renderer.removeClass(document.body, 'overlay');
    $("#add_flag_modal").removeClass("opened");
    $("#add_flag_form").removeClass("show");
  }

  removeFeature(video: Video){

    video.featured = false;
    this.initData(null, this.channelService.removeFeaturedVideo(this.default_channel._id, video._id), () => {
      this.featured_videos_length -= 1;
    });
  }

  showConfirmationModal(video: Video, index: number) {
    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    $(".signup_form").removeClass("show");
    $(".form_popup#login_form_popup").addClass("opened");
    $(".login_form").addClass("show");
    this.video_to_be_deleted = video;
    this.index = index;
    if (this.index == undefined) {
      this.playlists.forEach(current => {
        if (current.videos.map(item => item._id).indexOf(video._id) > -1) {
          current.checked = true;
        }
      });
    }
  }

  hideConfirmationModal(){
    this.renderer.removeClass(document.body, 'overlay');
    $(".form_popup").removeClass("opened");
    $(".signup_form").removeClass("show");
    $(".login_form").removeClass("show");
    if (this.playlists.length > 0) {
      this.playlists.forEach(current => {
        current.checked = false;
      });
    }
  }

  checkbox_clicked(event: any, playlist: Playlist) {
    if (event.target.checked == true) {
      playlist.videos.push(this.video_to_be_deleted);
      this.playlistService.updatePlaylist(playlist).subscribe(
        data => {

        }, error => {
          console.log(error);
        }
      );
    } else {
      const video_index = playlist.videos.map(current => current._id).indexOf(this.video_to_be_deleted._id);
      if (video_index > -1) {
        playlist.videos.splice(video_index, 1);
        this.playlistService.updatePlaylist(playlist).subscribe(
          data => {

          }, error => {
            console.log(error);
          }
        );
      }
    }
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

  playVideo(video: Video){

    if(video.upload_status == "COMPLETE"){
      this.router.navigate(['/video', video.source_id]);
    }
  }

}
