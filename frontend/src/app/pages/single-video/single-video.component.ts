import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, DomSanitizer } from '@angular/platform-browser';

import Player from '@vimeo/player';

import { CanDeactivateComponent } from '../shared/guard/can-deactivate.guard';
import { CommonComponent } from '../shared/mock/component';

import { VideoService } from '../shared/services/video.service';
import { CommentService } from '../shared/services/comment.service';
import { TokenService } from '../shared/authentication/token.service';
import { UserService } from '../shared/services/user.service';
import { PlaylistService } from '../shared/services/playlist.service';

import { User } from '../shared/models/user';
import { Comment } from '../shared/models/comment';
import { Video } from '../shared/models/video';
import { Playlist } from '../shared/models/playlist';
import { NotifyService } from '../shared/services/notify.service';
import { Notify } from '../shared/models/notify';
import { ChannelService } from '../shared/services/channel.service';

import { Observable } from 'rxjs';

declare var $: any;
declare var window: any;

@Component({
  selector: 'pft-single-video',
  templateUrl: './single-video.component.html',
  styleUrls: ['./single-video.component.css']
})
export class SingleVideoComponent extends CommonComponent implements OnInit, CanDeactivateComponent {

  video_id: string = "";
  safe_url: any = "";
  video: Video = new Video();
  player: Player = null;
  hide_play_button: boolean = false;

  autoplay_mode: boolean = true;
  public show_more: boolean = false;

  similar_videos: any[] = []; // TODO: add recommended here
  watch_later_queue: any[] = []; // to get and remove the first item: watch_later_queue.shift();
  comments: Comment[] = [];
  new_comment: Comment = new Comment();
  user: User = new User();
  subComments: any[] = [];
  showReplies: any[] = [];
  subCommentInput: any[] = [];
  new_subComment: any[] = [];
  read_more: any[] = [false];
  read_more_subComment: any[] = [false];

  public user_subscriptions: any[] = [];
  public user_playlists: Playlist[] = [];
  public new_playlist: Playlist = new Playlist();

  public playlist_success_message: string = "";
  public playlist_warning_message: string = "";
  public playlist_error_message: string = "";
  public playlist_add_progress: number = 0;

  public flag_success_message: string = "";
  public flag_warning_message: string = "";
  public flag_error_message: string = "";
  public flag_add_progress: number = 0;

  public video_flags: any = {
    inappropriate: false,
    copyrighted: false,
    comment: "",
    video: null,
    channel: null
  };

  public video_url: String = "";

  public show_sort_options: boolean = false;

  // for mobile view only
  public show_hide_similar_video: boolean = true;

  // for edit/delete comment
  public showCommentControl: boolean[] = [false];
  public showSubCommentControl: any[] = []; // false
  public selectedComment: any;
  public selectedIndex: any;
  public clickedIndex: any;
  public editSubCommentValue: any[] = []; // false
  public editCommentValue: boolean[] = [false];
  public oldCommentContent: string = undefined;
  public oldSubCommentContent: string = undefined;

  private setInterval_loop_index: number = 0;

  public video_info = {title: '', description: ''};

  public show_user_interaction_button: boolean = false;

  // TODO: Use vimeo player to create the iframe
  // https://github.com/vimeo/player.js#create-a-player
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private videoService: VideoService,
    private sanitizer: DomSanitizer,
    private commentService: CommentService,
    private tokenService: TokenService,
    private userService: UserService,
    private playlistService: PlaylistService,
    private renderer: Renderer2,
    private notificationService: NotifyService,
    private channelService: ChannelService,
    private meta: Meta
  ) {
    super();
  }

  ngOnInit() {
    // if (!this.tokenService.decodeUserToken()) {
    //   this.router.navigate(['/login']);
    // }

    this.route.params.subscribe(params => {

      const connected_user = this.tokenService.decodeUserToken();

      if(connected_user && connected_user._id){
        this.initData(this.user, this.userService.getConnected());
        this.initData(this.user_subscriptions, this.userService.getSubscriptions());
      }

      this.video_id = params.video_id;
      this.video_url = window.location.href;

      const tmp = "https://player.vimeo.com/video/" + this.video_id + "?title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=156614";
      this.safe_url = this.sanitizer.bypassSecurityTrustResourceUrl(tmp);

      this.getVideoBySourceId(this.video_id, () => {

        if(!this.video._id){

          // console.log("erreur survenue");
          return this.router.navigate(['/']);
        }

        // change meta (facebook)
        this.meta.updateTag({
          property: "og:title", content: this.video.title
        })
        // this.meta.updateTag({
        //   property: "og:type", content: "article"
        // })
        this.meta.updateTag({
          property: "og:description", content: this.video.description
        })
        this.meta.updateTag({
          property: "og:image", content: this.video.thumbnail ? this.video.thumbnail.replace(/_640x360/g, "") : "https://projectfitnesstv.com/assets/images/default_bg.png"
        })
        this.meta.updateTag({
          property: "og:url", content: "https://projectfitnesstv.com" + this.route.snapshot['_routerState']['url']
        })
        this.meta.updateTag({
          property: "og:site_name", content: this.video.thumbnail
        })
        // this.meta.updateTag({
        //   property: "fb:app_id", content: "2018567855090997"
        // })

        // (twitter)
        // this.meta.updateTag({
        //   property: "twitter:card", content: "summary_image_large"
        // })
        // this.meta.updateTag({
        //   property: "twitter:site", content: "@PFitnesstv"
        // })
        this.meta.updateTag({
          property: "twitter:image:alt", content: this.video.title
        })

        this.createVideoPlayer(this.video_id);
        // this.getComments(this.video._id);   // Hasina: I commented this out, let's use the old one inside getVideoBySourceId() // coz when we call it here, the comment in autoplay don't change while the player play the next video
        this.getSimilarVideos(this.video_id);
      })

      // this.playVideo();
    },
    error => {
      console.log("Error while retrieving parameters ...");
    })
  }

  showAddPlaylistModal(){

    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    $("#add_to_playlist_modal").addClass("opened");
    $("#add_to_playlist_form").addClass("show");
  }

  hideAddToPlaylistModal(){

    this.renderer.removeClass(document.body, 'overlay');
    $("#add_to_playlist_modal").removeClass("opened");
    $("#add_to_playlist_form").removeClass("show");
  }

  showShareModal(){

    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    $("#add_share_modal").addClass("opened");
    $("#add_share_form").addClass("show");
  }

  hideShareModal(){

    this.renderer.removeClass(document.body, 'overlay');
    $("#add_share_modal").removeClass("opened");
    $("#add_share_form").removeClass("show");
  }

  showFlagModal(){

    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    $("#add_flag_modal").addClass("opened");
    $("#add_flag_form").addClass("show");
  }

  hideFlagModal(){

    this.renderer.removeClass(document.body, 'overlay');
    $("#add_flag_modal").removeClass("opened");
    $("#add_flag_form").removeClass("show");
  }

  getVideoBySourceId(video_id: string, callback = null) {

    this.initData(this.video, this.videoService.getVideoBySourceId(video_id), () => {

      if(this.video._id){
        this.show_user_interaction_button = true;
        this.video.description && this.video.description.length > 260 ? this.show_more = false : this.show_more = true;
        if (this.video.user_id != this.user._id) {
          if (this.video.price && this.video.price > 0 && (this.isInPurchasedVideo(this.video._id) == false) ) {
            this.router.navigate(['/payment/' + this.video.source_id]);
          }
        }
        this.video.is_favorite = this.user.favorite_videos.indexOf(this.video._id) > -1;
        this.video.is_liked = this.user.liked_videos.indexOf(this.video._id) > -1;
        this.video.is_disliked = this.user.disliked_videos.indexOf(this.video._id) > -1;
        this.video.is_to_watch_later = this.user.watch_later_videos.map(current => current._id || current).indexOf(this.video._id) > -1;
      }

      if(localStorage.getItem('action') != (null || undefined)) this.loadTaskAfterLogin();
      this.getComments(this.video._id);

      if(callback){
        callback();
      }
    }, false, true)

  }

  // -------------------------------------
  // Creating a video player dynamically
  // -------------------------------------
  createVideoPlayer(video_id: string) {

    // this.video_id = video_id;
    // this.video_url = window.location.href;

    if (this.player) {
      this.playNextVideo(video_id);
    }
    else {

      const options = {
        id: video_id,
        responsive: true,
        /*controls: false*/
      };

      this.player = new Player('vimeo_video', options);
      //this.player = new Player('vimeo_video');
      this.listenToVideoEvents();

      // resume video
      this.route.queryParams.subscribe(params => {
        if(params.t){
          this.player.setCurrentTime(params.t);
        }
      })

      this.playVideo();
    }
  }

  playVideo() {
    this.player.play().catch(error => {})
  }

  playNextVideo(video_id: string) {

    const self = this;
    this.player.destroy()
    .then(function () {

      // the player was destroyed
      const options = {
        id: video_id,
        responsive: true,
        /*controls: false*/
      };

      document.getElementById("vimeo_video").innerHTML = "";
      self.player = new Player('vimeo_video', options);
      self.listenToVideoEvents();
      self.getVideoBySourceId(video_id);
      self.getSimilarVideos(video_id); // TODO: Maybe we should use the same original list of videos here

      // update address bar to reflect the new video
      window.history.pushState(video_id, 'Watch Video', '/video/' + video_id);

      self.player.play().catch(error => {});
    })
    .catch(function (error) {
      // an error occurred
    });
  }

  listenToVideoEvents() {

    const self = this;

    this.player.on('loaded', function(){

      const frame = $('#vimeo_video iframe')[0];
      if (frame !== null) {
        frame.style.height = '470px';
      }

      const container = $('#vimeo_video')[0];
      if(container !== null){
        container.style.background = "#131313";
      }
    })

    // Play event
    this.player.on('play', function (data) {

      // self.initData(null, self.videoService.reportPlay(self.video._id));
      self.hide_play_button = true;

      // to make sure that user watch it for at least 3 secs
      setTimeout(function(){
        let current_time_init: number = 0;
        new Promise((resolve, reject) => self.player.getCurrentTime().then((current_time) => resolve(current_time))).then(current_time => {
          current_time_init = Number(current_time);
          if (current_time >= 3) {
            self.initData(null, self.videoService.reportPlay(self.video._id));
          }

          // this "if" section should be improved, (for the improvement
          // it's better if we can get total time played in a video by player event)
          if (current_time_init < 3) {
            let setInterval_loop = setInterval(function(){
              new Promise((resolve, reject) => self.player.getCurrentTime().then((current_time) => resolve(current_time))).then(current_time => {
                if (current_time >= 3) {
                  self.initData(null, self.videoService.reportPlay(self.video._id));
                  clearInterval(setInterval_loop);
                }
                self.setInterval_loop_index += 1;
                if (self.setInterval_loop_index >= 6) {
                  clearInterval(setInterval_loop);
                }
              });
            }, 10000);
          }
        });
      }, 3500);
    });

    // Pause event
    this.player.on('pause', function (data) {

      // moved this to canDeactivate guard handler
      self.hide_play_button = false;
      self.updatePlayState("paused");

      return self.player.pause().catch(error => {});
    });

    // End state
    this.player.on('ended', function (data) {

      self.hide_play_button = true;
      self.updatePlayState("ended");
      self.initData(null, self.videoService.reportPlay(self.video._id));

      if (self.autoplay_mode && self.watch_later_queue.length > 0) {

        const next_video = self.watch_later_queue.shift();
        self.similar_videos.shift(); // refesh video list
        self.playNextVideo(next_video);
        //self.router.navigate(['video', next_video]); // This doesn't work as it will reload the page (losing states)
      }
    });
  }

  updatePlayState = async (state): Promise<boolean> => {

    if(this.player){

      switch(state){
        case "quitted":
          const current_time: number = await new Promise((resolve, reject) => this.player.getCurrentTime().then((current_time) => resolve(current_time)));
          const duration: number = await new Promise((resolve, reject) => this.player.getDuration().then((duration) => resolve(duration)));

          if(current_time && current_time < duration){
            if (this.tokenService.decodeUserToken()) {
              await new Promise((resolve, reject) => this.videoService.updatePlayState(this.video._id, current_time).subscribe(
                data => resolve(data),
                error => reject(error)));
              this.userService.getLastPausedVideo();
            }
            return Promise.resolve(true);
          }
          else{
            return Promise.resolve(true);
          }
        case "ended":
          if (this.tokenService.decodeUserToken()) {
            await new Promise((resolve, reject) => this.videoService.updatePlayState(this.video._id, 0).subscribe(
              data => resolve(data),
              error => reject(error)));
            this.userService.getLastPausedVideo();
          }
          return Promise.resolve(true);
        case "paused":
          const current_time_for_paused_video: number = await new Promise((resolve, reject) => this.player.getCurrentTime().then((current_time) => resolve(current_time)));
          const duration_for_paused_video: number = await new Promise((resolve, reject) => this.player.getDuration().then((duration) => resolve(duration)));

          if(current_time_for_paused_video && current_time_for_paused_video < duration_for_paused_video){
            if (this.tokenService.decodeUserToken()) {
              await new Promise((resolve, reject) => this.videoService.updatePlayState(this.video._id, current_time_for_paused_video).subscribe(
                data => {
                  this.userService.getLastPausedVideo();
                  resolve(data);
                },
                error => reject(error)));
              }
            return Promise.resolve(true);
          }
          else{
            return Promise.resolve(true);
          }
        default:
          return Promise.resolve(true);
      }
    }
    else{
      return Promise.resolve(true);
    }
  }

  addComment(parent: Comment) {

    if (!(this.tokenService.user && this.tokenService.user._id)) {
      localStorage.setItem('url',this.route.snapshot['_routerState']['url']);
      localStorage.setItem('action','addComment');
      localStorage.setItem('params',this.new_comment.comment);
      localStorage.setItem('reloaded', 'no');
      this.router.navigate(['/login']);
    } else {

      if (localStorage.getItem('reloaded') == 'yes') {

        if (parent && this.new_subComment[parent._id].comment) {

          this.new_subComment[parent._id].parent = parent._id;
          this.new_subComment[parent._id].user_id = this.user;
          this.new_subComment[parent._id].video_id = this.video._id;

          this.commentService.createVideoComment(this.new_subComment[parent._id]).subscribe(data => {

            let created_subcomment = JSON.parse(JSON.stringify(this.new_subComment[parent._id]));
            created_subcomment.meta = {likes: [], dislikes: []};
            created_subcomment._id = data;
            created_subcomment.user_id = this.user;
            created_subcomment.created = new Date();
            this.subComments[parent._id].unshift(created_subcomment);

            this.new_subComment[parent._id] = new Comment();

            this.subCommentInput[parent._id] = false;
            this.read_more_subComment[data] = false;

            // for notification
            const notification = new Notify();
            notification.sender = {_id: this.user._id, avatar_card: this.user.avatar_card, avatar_color: this.user.avatar_color, full_name: this.user.full_name}; // Avatar needed for notification
            notification.receiver = this.video.user_id;
            notification.type = 'COMMENT';
            notification.comment = data;
            notification['video_name'] = this.video.title;

            this.notificationService.createNotification(notification).subscribe(
              result => {

              }, error => {
                console.log(error);
              }
            );

            localStorage.removeItem('action');
            localStorage.removeItem('params');
            localStorage.removeItem('url');
          }, error => {
            console.log(error);
          });
        }

        if(localStorage.getItem('action')) this.new_comment.comment = localStorage.getItem('params');
        if (this.new_comment.comment) {

          this.new_comment.user_id = this.user;
          this.new_comment.video_id = this.video;

          this.commentService.createVideoComment(this.new_comment).subscribe(data => {

            let created_comment = JSON.parse(JSON.stringify(this.new_comment));
            created_comment.meta = {likes: [], dislikes: []};
            created_comment._id = data;
            created_comment.created = new Date();
            this.comments.unshift(created_comment);

            this.new_comment = new Comment();
            this.new_subComment[data] = new Comment();
            this.subComments[data] = [];

            this.read_more[data] = false;

            // for notification
            const notification = new Notify();
            notification.sender = {_id: this.user._id, avatar_card: this.user.avatar_card, avatar_color: this.user.avatar_color, full_name: this.user.full_name}; // Avatar needed for notification
            notification.receiver = this.video.user_id;
            notification.type = 'COMMENT';
            notification.comment = data;
            notification['video_name'] = this.video.title;

            this.notificationService.createNotification(notification).subscribe(
              result => {

              }, error => {
                console.log(error);
              }
            );

            localStorage.removeItem('action');
            localStorage.removeItem('params');
            localStorage.removeItem('url');
          }, error => {
            console.log(error);
          });
        }

      } else {

        localStorage.setItem('reloaded', 'yes');
      }

    }
  }

  updateCommentLike(comment: Comment, param: string, subComment: boolean, index: number) {

    if (param == 'like') {

      if (comment.meta.likes.length == 0) {

        comment.meta.likes.push(this.user._id);
        if (comment.meta.dislikes.indexOf(this.user._id) >= 0) {
          comment.meta.dislikes.splice(comment.meta.dislikes.indexOf(this.user._id), 1);
        }
      }
      else {

        if (comment.meta.likes.indexOf(this.user._id) >= 0) {
          comment.meta.likes.splice(comment.meta.likes.indexOf(this.user._id), 1);
        }
        else {

          comment.meta.likes.push(this.user._id);
          if (comment.meta.dislikes.indexOf(this.user._id) >= 0) {
            comment.meta.dislikes.splice(comment.meta.dislikes.indexOf(this.user._id), 1);
          }
        }
      }
    }
    else if (param == 'dislike') {

      if (comment.meta.dislikes.length == 0) {

        comment.meta.dislikes.push(this.user._id);
        if (comment.meta.likes.indexOf(this.user._id) >= 0) {
          comment.meta.likes.splice(comment.meta.likes.indexOf(this.user._id), 1);
        }
      }
      else {

        if (comment.meta.dislikes.indexOf(this.user._id) >= 0) {
          comment.meta.dislikes.splice(comment.meta.dislikes.indexOf(this.user._id), 1);
        }
        else {

          comment.meta.dislikes.push(this.user._id);
          if (comment.meta.likes.indexOf(this.user._id) >= 0) {
            comment.meta.likes.splice(comment.meta.likes.indexOf(this.user._id), 1);
          }
        }
      }
    }

    this.commentService.updateComment(comment).subscribe(data => {
      // update view
      // if (subComment == false) {
      //   // It seems it already done by [(ngModel)]
      //   /*if (param == 'like') {
      //     this.comments[index].meta.likes = this.comments[index].meta.likes + 1;
      //   } else if (param == 'dislike') {
      //     this.comments[index].meta.dislikes = this.comments[index].meta.dislikes + 1;
      //   }*/
      // } else if (subComment == true) {
      //   // It seems it already done by [(ngModel)]
      //   /*if (param == 'like') {
      //     this.subComments[comment._id][index].meta.likes = this.subComments[comment._id][index].meta.likes + 1;
      //   } else if (param == 'dislike') {
      //     this.subComments[comment._id][index].meta.dislikes = this.subComments[comment._id][index].meta.dislikes + 1;
      //   }*/
      // }
    }, error => {
      console.log(error);
    });
  }

  updateVideoLike(video: Video, param: string) {
    if (!(this.tokenService.user && this.tokenService.user._id)) {
      localStorage.setItem('url',this.route.snapshot['_routerState']['url']);
      localStorage.setItem('action','updateVideoLike');
      localStorage.setItem('params', param);
      localStorage.setItem('reloaded', 'no');
      this.router.navigate(['/login']);
    } else {

      if (localStorage.getItem('reloaded') == 'yes') {
        if (param == 'like') {
          if(!this.user.liked_videos){
            this.user.liked_videos = [];
          }

          if (this.user.liked_videos.indexOf(this.video._id) >= 0) {
            this.video.meta.likes = this.video.meta.likes - 1;
            if (this.video.meta.likes < 0) this.video.meta.likes = 0;
            this.video.is_liked = false;
            this.user.liked_videos.splice(this.user.liked_videos.indexOf(this.video._id), 1);
          }
          else {
            this.video.meta.likes = this.video.meta.likes + 1;
            this.video.is_liked = true;
            this.user.liked_videos.unshift(this.video._id);
          }

          if (this.user.disliked_videos && this.user.disliked_videos.indexOf(this.video._id) >= 0) {
            this.video.meta.dislikes = this.video.meta.dislikes - 1;
            if (this.video.meta.dislikes < 0) this.video.meta.dislikes = 0;
            this.video.is_disliked = false;
            this.user.disliked_videos.splice(this.user.disliked_videos.indexOf(this.video._id), 1);
          }
        } else if (param == 'dislike') {
          if(!this.user.disliked_videos){
            this.user.disliked_videos = [];
          }

          if (this.user.disliked_videos.indexOf(this.video._id) >= 0) {

            this.video.meta.dislikes = this.video.meta.dislikes - 1;
            if (this.video.meta.dislikes < 0) this.video.meta.dislikes = 0;
            this.video.is_disliked = false;
            this.user.disliked_videos.splice(this.user.disliked_videos.indexOf(this.video._id), 1);
          }
          else {

            this.video.meta.dislikes = this.video.meta.dislikes + 1;
            this.video.is_disliked = true;
            this.user.disliked_videos.unshift(this.video._id);
          }

          if (this.user.liked_videos && this.user.liked_videos.indexOf(this.video._id) >= 0) {

            this.video.meta.likes = this.video.meta.likes - 1;
            if (this.video.meta.likes < 0) this.video.meta.likes = 0;
            this.video.is_liked = false;
            this.user.liked_videos.splice(this.user.liked_videos.indexOf(this.video._id), 1);
          }
        }

        if (this.video.meta.likes < 0) this.video.meta.likes = 0; // Just to make sure that it won't give negative value
        if (this.video.meta.dislikes < 0) this.video.meta.dislikes = 0; // Just to make sure that it won't give negative value

        this.initData(null, this.videoService.updateVideo(this.video), () => {
          this.initData(null, this.userService.updateUser(this.user, ["liked_videos", "disliked_videos"]), () => {
            localStorage.removeItem('action');
            localStorage.removeItem('params');
            localStorage.removeItem('url');
          });
        });

      } else {
        localStorage.setItem('reloaded', 'yes');
      }

    }
  }

  getSimilarVideos(video_id: string) {

    this.videoService.getSimilarVideos(video_id).subscribe(data => {

      this.similar_videos = data.filter(item => item.source_id !== video_id);
      this.watch_later_queue = this.similar_videos.map(item => item.source_id); // TODO: fix this
    })
  }

  getComments(video_id: string) {

    this.commentService.getVideoComments(video_id).subscribe(result => {

        const all_comments = result;
        this.comments = all_comments.filter(current_comment => !current_comment.parent).map(current => {

          this.subComments[current._id] = [];
          this.showReplies[current._id] = false;
          this.new_subComment[current._id] = new Comment();
          this.subCommentInput[current._id] = false;
          this.read_more[current._id] = false;

          return current;
        });

        all_comments.filter(current_comment => current_comment.parent).forEach(current => {

          if(!this.subComments[current.parent._id]){
            this.subComments[current.parent._id] = [];
          }

          this.read_more_subComment[current._id] = false;
          this.subComments[current.parent._id].push(current);
        });

        this.comments.map((current, index) => {
          if (this.subComments[current._id] != undefined) {
            this.showSubCommentControl[index] = {};
            this.editSubCommentValue[index] = {};
          }
        });
      },
      error => {
        console.log(error);
      });
  }

  sortCommentsByDate(){
    this.comments.sort((a, b) => (new Date(b.created)).getTime() - (new Date(a.created)).getTime());
    this.show_sort_options = false;
  }

  sortCommentsByLikes(){
    this.comments.sort((a, b) => Number(b.meta.likes.length) - Number(a.meta.likes.length));
    this.show_sort_options = false;
  }

  subscribe(){

    if(this.video && this.video.channel_id && this.video.channel_id._id){
      this.initData(null, this.userService.subscribe(this.video.channel_id._id), () => {

        this.video.channel_id.meta.subscribers += 1;
        this.user_subscriptions.push({_id: this.video.channel_id._id});
      });
      this.userService.getChannelByOwner().subscribe(
        data => {
          const notification = new Notify();
          notification.sender = {_id: this.user._id, avatar_card: this.user.avatar_card, avatar_color: this.user.avatar_color, full_name: this.user.full_name}; // Avatar needed for notification
          notification.receiver = this.video.channel_id.owner;
          notification.type = 'SUBSCRIPTION';
          notification.subscription_channel = this.video.channel_id;
          notification.sender_channel = data[0];

          this.notificationService.createNotification(notification).subscribe(
            data => {

            }, error => {
              console.log(error);
            }
          );
        }, error => {
          console.log(error);
        }
      );
    }
  }

  unsubscribe(){

    if(this.video && this.video.channel_id && this.video.channel_id._id){

      this.initData(null, this.userService.unsubscribe(this.video.channel_id._id), () => {

        const subscription_index = this.user_subscriptions.map(current => current._id).indexOf(this.video.channel_id._id);

        if(subscription_index > -1){

          this.video.channel_id.meta.subscribers -= 1;
          this.user_subscriptions.splice(subscription_index, 1);
        }
      })

      console.log(this.user_subscriptions);
    }
  }

  userIsSubscribedToChannel(){

    if(!this.user_subscriptions){
      this.user_subscriptions = [];
    }

    if(this.video && this.video.channel_id && this.video.channel_id._id){
      return this.user_subscriptions.map(current => current._id).indexOf(this.video.channel_id._id) > -1;
    }

    return false;
  }

  addOrRemoveFromFavorites(){

    if (!(this.tokenService.user && this.tokenService.user._id)) {
      localStorage.setItem('url',this.route.snapshot['_routerState']['url']);
      localStorage.setItem('action','addOrRemoveFromFavorites');
    }

    if (!(this.tokenService.user && this.tokenService.user._id)) {
      localStorage.setItem('url',this.route.snapshot['_routerState']['url']);
      localStorage.setItem('action','addOrRemoveFromFavorites');
      localStorage.setItem('reloaded', 'no');
      this.router.navigate(['/login']);
    } else {

      if (localStorage.getItem('reloaded') == 'yes') {

        if(!this.video.is_favorite){
          this.initData(null, this.userService.addToFavorite(this.video._id), () => {
            this.video.is_favorite = true;

            localStorage.removeItem('action');
            localStorage.removeItem('params');
            localStorage.removeItem('url');
          })
        }
        else{
          this.initData(null, this.userService.removeFromFavorite(this.video._id), () => {
            this.video.is_favorite = false;

            localStorage.removeItem('action');
            localStorage.removeItem('params');
            localStorage.removeItem('url');
          })
        }

      } else {
        localStorage.setItem('reloaded', 'yes');
      }

    }
  }

  addOrRemoveFromWatchLater() {

    if (!(this.tokenService.user && this.tokenService.user._id)) {
      localStorage.setItem('url',this.route.snapshot['_routerState']['url']);
      localStorage.setItem('action','addOrRemoveFromWatchLater');
    }

    if (!(this.tokenService.user && this.tokenService.user._id)) {
      localStorage.setItem('url',this.route.snapshot['_routerState']['url']);
      localStorage.setItem('action','addOrRemoveFromWatchLater');
      localStorage.setItem('reloaded', 'no');
      this.router.navigate(['/login']);
    } else {

      if (localStorage.getItem('reloaded') == 'yes') {

        if (!this.user.watch_later_videos){
          this.user.watch_later_videos = [];
        }

        const video_index = this.user.watch_later_videos.map(current => current._id || current).indexOf(this.video._id.toString());

        if (video_index < 0) {
          this.user.watch_later_videos.push(this.video);
          this.video.is_to_watch_later = true;
          this.initData(null, this.userService.addToWatchLater(this.video._id), () => {
            localStorage.removeItem('action');
            localStorage.removeItem('params');
            localStorage.removeItem('url');
          });
        }
        else{
          this.user.watch_later_videos.splice(video_index, 1);
          this.video.is_to_watch_later = false;
          this.initData(null, this.userService.removeFromWatchLater(this.video._id), () => {
            localStorage.removeItem('action');
            localStorage.removeItem('params');
            localStorage.removeItem('url');
          });
        }

      } else {
        localStorage.setItem('reloaded', 'yes');
      }

    }
  }

  addToPlaylist(){

    if (!(this.tokenService.user && this.tokenService.user._id)) {
      localStorage.setItem('url',this.route.snapshot['_routerState']['url']);
      localStorage.setItem('action','addToPlaylist');
      localStorage.setItem('reloaded', 'no');
      this.router.navigate(['/login']);
    } else {

      if (localStorage.getItem('reloaded') == 'yes') {

        this.playlist_success_message = "";
        this.playlist_warning_message = "";
        this.playlist_error_message = "";
        this.playlist_add_progress = 0;

        if(this.user_playlists.length == 0){
          this.initData(this.user_playlists, this.playlistService.getMyPlaylists());
        }

        this.showAddPlaylistModal();

        localStorage.removeItem('action');
        localStorage.removeItem('params');
        localStorage.removeItem('url');

      } else {
        localStorage.setItem('reloaded', 'yes');
      }

    }
  }

  share(){

    if (!(this.tokenService.user && this.tokenService.user._id)) {
      localStorage.setItem('url',this.route.snapshot['_routerState']['url']);
      localStorage.setItem('action','share');
      localStorage.setItem('reloaded', 'no');
      this.router.navigate(['/login']);
    } else {

      if (localStorage.getItem('reloaded') == 'yes') {

        this.showShareModal();

        localStorage.removeItem('action');
        localStorage.removeItem('params');
        localStorage.removeItem('url');

      } else {
        localStorage.setItem('reloaded', 'yes');
      }
    }
  }

  flag(){

    if (!(this.tokenService.user && this.tokenService.user._id)) {
      localStorage.setItem('url',this.route.snapshot['_routerState']['url']);
      localStorage.setItem('action','flag');
      localStorage.setItem('reloaded', 'no');
      this.router.navigate(['/login']);
    } else {

      if (localStorage.getItem('reloaded') == 'yes') {

        this.flag_success_message = "";
        this.flag_warning_message = "";
        this.flag_error_message = "";
        this.flag_add_progress = 0;

        this.showFlagModal();

        localStorage.removeItem('action');
        localStorage.removeItem('params');
        localStorage.removeItem('url');

      } else {
        localStorage.setItem('reloaded', 'yes');
      }
    }
  }

  createAndAdd(){

    this.playlist_success_message = "";
    this.playlist_warning_message = "";
    this.playlist_error_message = "";

    if(this.new_playlist.title){

      this.new_playlist.videos.push(this.video);
      this.playlist_add_progress = 10;

      let created_playlist = new Playlist();
      this.initData(created_playlist, this.playlistService.createPlaylist(this.new_playlist), () => {

        this.playlist_add_progress = 100;
        this.user_playlists.unshift(JSON.parse(JSON.stringify(created_playlist)));

        this.playlist_success_message = "Video added to playlist '" + this.new_playlist.title + "'";
        setTimeout(() => this.playlist_add_progress = 0, 1000);

        this.new_playlist = new Playlist();
      })
    }
  }

  addToExisting(playlist: Playlist, playlist_id: string){

    this.playlist_success_message = "";
    this.playlist_warning_message = "";
    this.playlist_error_message = "";

    // The code below resolve the add of playlist error when switching from a video to another one
    // I think the problem is the binding caused by "playlist" variable
    // as html and component update it
    this.playlistService.getPlaylistDetail(playlist_id).subscribe(
      playlist_data => {

        $(".lg-in").scrollTop(0);

        if(!playlist_data.videos){
          playlist_data.videos = [];
        }

        const video_index = playlist_data.videos.map(current => current._id ? current._id : current).indexOf(this.video._id);

        if(video_index > -1){
          this.playlist_warning_message = "The video is already in playlist '" + playlist_data.title + "'";
        }
        else{

          // playlist_data.videos.push(this.video); // Moved to backend in updatePlaylistVideo() endpoint
          // playlist.videos.push(this.video); // Moved below, after updatePlaylistVideo() endpoint call
          this.playlist_add_progress = 10;

          this.initData(null, this.playlistService.addVideoToPlaylist(playlist_id, this.video._id), () => { // resolve the entity too large error from backend

            playlist.videos.push(this.video);
            this.playlist_add_progress = 100;
            this.playlist_success_message = "Video added to playlist '" + playlist_data.title + "'";
            setTimeout(() => this.playlist_add_progress = 0, 1000);
          });
        }

      }, error => {
        console.log(error);
    });
  }

  flagVideo(){

    this.flag_success_message = "";
    this.flag_warning_message = "";
    this.flag_error_message = "";
    this.flag_add_progress = 0;

    $(".lg-in").scrollTop(0);

    // Andry Code
    // I didn't change anything on Andry frontend's

    // After seeing last template of video report of pft-tv
    // I decide to keep both of them
    this.video_flags.video = this.video._id;
    this.initData(null, this.videoService.flag(this.video._id, this.video_flags), () => {

      /*this.video_flags = {
        inappropriate: false,
        copyrighted: false,
        comment: ""
      }*/

      this.flag_add_progress = 50;

      // Hasina Code
      if(!this.user.report_history){
        this.user.report_history = [];
      }
      this.user.report_history.unshift(this.video_flags);
      this.userService.updateUser(this.user, ["report_history"]).subscribe(
        data => {

          this.flag_add_progress = 100;
          this.flag_success_message = "Your reporting has been posted";

          this.video_flags = {
            inappropriate: false,
            copyrighted: false,
            comment: "",
            video: null
          };

          setTimeout(() => this.playlist_add_progress = 0, 1000);
          // this.hideFlagModal();
        }, error => {
          console.log(error);
        }
      );
    })
  }

  isInWatchLater(video_id: string) {
    return this.user.watch_later_videos.map(current => current._id).indexOf(video_id) > -1;
  }

  isInPurchasedVideo(video_id: string) {
    let found: boolean = false;
    this.user.purchased_videos.map((current: any) => {
      if (current == video_id) {
        found = true;
      }
    });
    return found;
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

  getTime() {

  }

  deleteSubComment(parent_id: string, index: number) {
    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    $("#sub_comment_confirmation_modal").addClass("opened");
    $("#sub_comment_confirmation_form").addClass("show");
    this.selectedComment = parent_id;
    this.selectedIndex = index;
  }

  deleteComment(index: number) {
    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    $("#comment_confirmation_modal").addClass("opened");
    $("#comment_confirmation_form").addClass("show");
    this.clickedIndex = index;
  }

  hideSubCommentConfirmationModal(){
    this.renderer.removeClass(document.body, 'overlay');
    $("#sub_comment_confirmation_modal").removeClass("opened");
    $("#sub_comment_confirmation_form").removeClass("show");
  }

  hideCommentConfirmationModal(){
    this.renderer.removeClass(document.body, 'overlay');
    $("#comment_confirmation_modal").removeClass("opened");
    $("#comment_confirmation_form").removeClass("show");
  }

  removeSubComment() {
    this.commentService.deleteComment(this.subComments[this.selectedComment][this.selectedIndex]).subscribe(
      data => {
        this.subComments[this.selectedComment].splice(this.selectedIndex, 1);
        if(this.subComments[this.selectedComment].length == 0) {
          this.showReplies[this.selectedComment] = false;
        }
        this.selectedComment = undefined;
        this.selectedIndex = undefined;
        this.hideSubCommentConfirmationModal();
      }, error => {
        console.log(error);
      }
    );
  }

  removeComment() {
    this.commentService.deleteComment(this.comments[this.clickedIndex]).subscribe(
      data => {
        this.comments.splice(this.comments.indexOf(this.comments[this.clickedIndex]), 1);
        this.clickedIndex = undefined;
        this.hideCommentConfirmationModal();
      }, error => {
        console.log(error);
      }
    );
  }

  updateSubComment(parent_id: string, comment: any, index_i: number, index_j: number) {
    if (this.oldSubCommentContent != comment.comment) comment.edited = true;
    this.commentService.updateComment(comment).subscribe(
      data => {

        if(!this.editSubCommentValue[index_i]){
          this.editSubCommentValue[index_i] = [];
        }

        this.editSubCommentValue[index_i][index_j] = false;
      }, error => {
        console.log(error);
      }
    );
  }

  updateComment(comment: any, index: number) {
    if (this.oldCommentContent != comment.comment) comment.edited = true;
    this.commentService.updateComment(comment).subscribe(
      data => {
        this.editCommentValue[index] = false;
      }, error => {
        console.log(error);
      }
    );
  }

  restoreSubCommentValue(parent_id: string, content: string, index: number) {
    this.subComments[parent_id][index].comment = this.oldSubCommentContent;
    this.oldSubCommentContent = undefined;
  }

  restoreCommentValue(content: string, index: number) {
    this.comments[index].comment = this.oldCommentContent;
    this.oldCommentContent = undefined;
  }

  getOldComment(content: string) {
    this.oldCommentContent = content;
  }

  getOldSubComment(content: string) {
    this.oldSubCommentContent = content;
  }

  // excerpt(text: string){
  //   if (text) return text.length > 260 ? text.substring(0, 260) + "..." : text;
  // }

  loadTaskAfterLogin() {
    let action = localStorage.getItem('action');
    // let params = JSON.JSON.stringify(JSON.parse(localStorage.getItem('params')));
    let params = localStorage.getItem('params');

    if (action == 'updateVideoLike') {
      this.updateVideoLike(this.video, params);
    }

    if (action == 'addOrRemoveFromFavorites') {
      this.addOrRemoveFromFavorites();
    }

    if (action == 'addOrRemoveFromWatchLater') {
      this.addOrRemoveFromWatchLater();
    }

    if (action == 'addToPlaylist') {
      this.addToPlaylist();
    }

    if (action == 'share') {
      this.share();
    }

    if (action == 'flag') {
      this.flag();
    }

    if (action == 'addComment') {
      this.addComment(undefined);
    }
  }

  // async canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
  canDeactivate(): boolean {
    this.updatePlayState("quitted");
    return true;
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
