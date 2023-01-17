import { Component, OnInit, Renderer2, HostListener } from '@angular/core';

import { CommonComponent } from '../../../shared/mock/component';

import { UserService } from '../../../shared/services/user.service';
import { TokenService } from '../../../shared/authentication/token.service';
import { User } from '../../../shared/models/user';
import { Video } from '../../../shared/models/video';
import { ActivatedRoute } from '@angular/router';
import { PlaylistService } from '../../../shared/services/playlist.service';
import { Playlist } from '../../../shared/models/playlist';
import { ChannelService } from '../../../shared/services/channel.service';
import { Channel } from '../../../shared/models/channel';
import { VideoService } from 'src/app/pages/shared/services/video.service';

declare var $: any;

@Component({
  selector: 'pft-user-playlist-detail',
  templateUrl: './user-playlist-detail.component.html',
  styleUrls: ['./user-playlist-detail.component.css']
})
export class UserPlaylistDetailComponent extends CommonComponent implements OnInit {

  public user: User = new User();
  public index: number;
  public user_subscriptions: any[] = [];
  public playlist: Playlist = new Playlist();
  public channels: Channel[] = [];
  public edit_title: boolean = undefined;
  public old_title_value: string = undefined;
  public edit_channel: boolean = undefined;
  public old_channel_value: any = undefined;
  public loading: boolean = false;

	public aria_selected: string = "search";
  public search_term: string = "";
  public search_results: Video[] = [];
  public my_videos: Video[] = [];

  public coach_mode: boolean = true;

  public video_info = {title: '', description: ''};

  public already_exist: boolean = false;

  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private playlistService: PlaylistService,
    private channelService: ChannelService,
    private videoService: VideoService
  ) {
    super();
  }

  ngOnInit() {
    const logged_in_user = this.tokenService.decodeUserToken();

    this.initData(this.user, this.userService.getUserDetailPopulate(logged_in_user._id), () => {
      if(this.user.account_type == 'USER') this.coach_mode = false;
    });

    this.user_subscriptions = this.tokenService.getUserSubscriptions();

    if(!this.user_subscriptions){
      this.user_subscriptions = [];
      this.initData(this.user_subscriptions, this.userService.getSubscriptions(), () => {
        this.tokenService.saveUserSubscriptions(this.user_subscriptions);
      });
    }

    this.route.params.subscribe(params => {
      if (params.id) {

        this.playlistService.myPlaylistsForUserAccountPlaylistDetailView(params.id).subscribe(
          data => {
            this.playlist = data;
          }, error => {
            console.log(error);
          }
        );
      }
    });

    this.channelService.getMyChannels().subscribe(
      data => {
        this.channels = data;
        if(this.channels[0] && this.channels[0].active == false) this.coach_mode = false;
      }, error => {
        console.log(error);
      }
    );

    this.videoService.getUserUploadedVideo().subscribe(
      data => {
        this.my_videos = data;
      }, error => {
        console.log(error);
      }
    );
  }

  removeVideoFromPlaylist() {
    this.loading = true;
    this.playlistService.removeVideoFromPlaylist(this.playlist._id, this.playlist.videos[this.index]._id).subscribe(
      data => {
        this.playlist.videos.splice(this.index, 1);
        this.loading = false;
        this.index = undefined;
        this.hideConfirmationModal();
      }, error => {
        console.log(error);
      }
    );
  }

  showConfirmationModal(index: number) {
    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    $(".signup_form").removeClass("show");
    $(".form_popup#login_form_popup").addClass("opened");
    $(".login_form").addClass("show");
    this.index = index;
  }

  hideConfirmationModal(){
    this.renderer.removeClass(document.body, 'overlay');
    $(".form_popup").removeClass("opened");
    $(".signup_form").removeClass("show");
    $(".login_form").removeClass("show");
  }

  addNewVideoModal(){
    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    $("#add_video_modal").addClass("opened");
    $("#add_video_form").addClass("show");
    this.already_exist = false;
  }

  hideNewVideoModal() {
    this.renderer.removeClass(document.body, 'overlay');
    $("#add_video_modal").removeClass("opened");
    $("#add_video_form").removeClass("show");

    // unselect all checkboxes when the user close the modal
    // so if he re-open the modal, all checkboxes will be unselected by default
    this.search_results.map(current => current['checked'] ? current['checked'] = false : '');
    this.my_videos.map(current => current['checked'] ? current['checked'] = false : '');
    this.search_term = ''; // Re-init search term value to void
    this.search_results = []; // Re-init search results value to void
  }

  checkbox_clicked(event: any, video: Video) {
    this.already_exist = false;
    if (event.target.checked == true) {
      this.playlistService.addVideoToPlaylist(this.playlist._id, video._id).subscribe(
        data => {
          if(data == 'already_exist') {
            event.target.checked = false;
            video['checked'] = false;
            this.already_exist = true;
          } else {
            this.playlist.videos.push(video);
          }
        }, error => {
          console.log(error);
        }
      );
    } else {
      const video_index = this.playlist.videos.map(current => current._id).indexOf(video._id);
      if (video_index > -1) {
        this.playlistService.removeVideoFromPlaylist(this.playlist._id, video._id).subscribe(
          data => {
            this.playlist.videos.splice(video_index, 1);
          }, error => {
            console.log(error);
          }
        );
      }
    }
  }

  doSearch(){
    let filter: any = {
      upload_date: '',
      type: 'video',
      duration: '',
      features: '',
      sort_by: 'relevance',
      term: this.search_term
    };

		this.videoService.getVideoByFilter(filter).subscribe(
      data => {
        this.search_results = data.filter(current => { return !current.price || current.price == 0 });
      }, error => {
        console.log(error);
      }
    );
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

  // Really needed to fix the default value selected of <select> on view
  compareFn(c1: Channel, c2: Channel): boolean {
    return c1 && c2 ? c1._id === c2._id : c1 === c2;
  }

  updatePlaylist() {
    if (this.playlist.channel && this.playlist.channel.title == undefined) {
      const result = this.channels.filter((current) => current._id == this.playlist.channel.toString());
      this.playlist.channel = result[0];
    }
    if (this.playlist.channel == undefined) {
      delete this.playlist.channel;
    }
    this.loading = true;
    this.playlistService.updatePlaylist(this.playlist).subscribe(
      data => {
        this.loading = false;
        this.index = undefined;
        this.hideConfirmationModal();
      }, error => {
        console.log(error);
      }
    );
  }

  updatePlaylistTitleOrChannel() {
    if (this.playlist.channel && this.playlist.channel.title == undefined) {
      const result = this.channels.filter((current) => current._id == this.playlist.channel.toString());
      this.playlist.channel = result[0];
    }
    if (this.playlist.channel == undefined) {
      delete this.playlist.channel;
    }
    this.loading = true;
    this.playlistService.updatePlaylistTitleOrChannel(this.playlist).subscribe(
      data => {
        this.loading = false;
        this.index = undefined;
        this.hideConfirmationModal();
      }, error => {
        console.log(error);
      }
    );
  }

  excerpt(text: string){
    if (text) return text.length > 40 ? text.substring(0, 40) + "..." : text;
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
