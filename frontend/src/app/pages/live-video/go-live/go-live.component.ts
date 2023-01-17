import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CanDeactivateComponent } from '../../shared/guard/can-deactivate.guard';

import { CommonComponent } from '../../shared/mock/component';
import { TokenService } from '../../shared/authentication/token.service';
import { VideoService } from '../../shared/services/video.service';
import { Video } from '../../shared/models/video';

import { environment } from '../../../../environments/environment';
import { ChatService } from '../../shared/services/chat.service';
import { User } from '../../shared/models/user';
import { Comment } from '../../shared/models/comment';
import { CommentService } from '../../shared/services/comment.service';
import { Notify } from '../../shared/models/notify';
import { NotifyService } from '../../shared/services/notify.service';
import { UserService } from '../../shared/services/user.service';

import * as twilioVideo from 'twilio-video';

declare var MediaRecorder: any;

declare var $: any;
declare var window: any;

@Component({
  selector: 'pft-go-live',
  templateUrl: './go-live.component.html',
  styleUrls: ['./go-live.component.css']
})
export class GoLiveComponent extends CommonComponent implements OnInit, CanDeactivateComponent {

  // public liveEvent: Video = new Video();

  // private mediaStream: any;
  // private requestAnimation: any;
  // private mediaRecorder: any;

  // public got_media: boolean = false;
  // public socket_ready: boolean = false;
  // private socket_closed: boolean = true;
  // public live: boolean = false;
  // public live_loading: boolean = false;

  // public streamKey: string = "";

  // // View
  // public error: boolean = false;
  // public error_message: string = "";
  // public timer: number = 0;
  // private interval = null;
  
  // @ViewChild('streamPreviewer', {static: true}) streamPreviewer: ElementRef;

  // private socketConnection: any;

  // public chats: Comment[] | any = [];
  // public new_comment: Comment = new Comment();
  // public user: User = new User();
  // public show_live_chat: boolean = true;

  // public show_more: boolean = false;

  // constructor(private elementRef: ElementRef,
  //   private tokenService: TokenService,
  //   private liveService: VideoService,
  //   private route: ActivatedRoute,
  //   private router: Router,
  //   private chatService: ChatService,
  //   private commentService: CommentService,
  //   private notificationService: NotifyService,
  //   private userService: UserService,
  //   private renderer: Renderer2
  // ) {
  //   super();
  // }

  // ngOnInit() {

  //   if (!(this.tokenService.user && this.tokenService.user._id))
  //     this.router.navigate(['/login']);
  //   else
  //     this.user = this.tokenService.user;

  //   this.route.params.subscribe(
  //     params => {
  //       this.getLiveComment(params["live_id"]);
  //       this.initData(this.liveEvent, this.liveService.getLive(params.live_id), () => {

  //         if(this.liveEvent.user_id != this.tokenService.user._id){

  //           alert("You don't have permission to broadcast in this Live. Please create your own Live event!");

  //           this.router.navigate(['/', 'live']);
  //         }

  //         this.streamKey = this.liveEvent._id;

  //         this.readySocket();
  //         this.initStream();

  //         this.liveEvent.description && this.liveEvent.description.length > 260 ? this.show_more = false : this.show_more = true;

  //         this.chatService.getLiveChat().subscribe(
  //           data => {
  //             if (data.chat && data.chat.length) {
  //               data.chat.map(current => {
  //                 if (current.live_id == this.liveEvent._id) {
  //                   this.chats.push(current);
  //                 }
  //               });
  //             }
  //           }, error => {
  //             console.log(error);
  //           }
  //         );
      
  //         this.chatService.getViewer().subscribe(
  //           data => {
  //             if (data.viewer && data.viewer.length) {
  //               data.viewer.map(current => {
  //                 if (current.live_id == this.liveEvent._id) {
  //                   this.liveEvent.meta.views = current.viewers;
  //                 }
  //               });
  //             }
  //           }, error => {
  //             console.log(error);
  //           }
  //         );

  //         this.chatService.getLikes().subscribe(
  //           data => {
  //             if (data.likes && data.likes.length) {
  //               data.likes.map(current => {
  //                 if (current.live_id == this.liveEvent._id) {
  //                   this.liveEvent.meta.likes = current.likes;
  //                   this.liveEvent.meta.dislikes = current.dislikes;
  //                 }
  //               });
  //             }
  //           }, error => {
  //             console.log(error);
  //           }
  //         );

  //       })
  //     })

  //   // this.initStream()
  // }

  // async initStream() {

  //   try {
  //     this.mediaStream = await navigator.mediaDevices.getUserMedia({
  //       audio: true,
  //       video: true
  //     })
  //   }
  //   catch(error) {

  //     this.error = true;

  //     switch(error.name){
  //       case 'NotAllowedError':
  //         this.error_message = "Error accessing your camera and/or microphone device. To use Live, you must allow your browser to access those devices.";
  //         break;
  //       default:
  //         this.error_message = error.message
  //     }
  //   }
    
  //   if(this.mediaStream){

  //     this.got_media = true;

  //     this.streamPreviewer.nativeElement.srcObject = this.mediaStream;
  //     this.streamPreviewer.nativeElement.play();
  //   }
  // }

  // freeStream() {

  //   if(this.mediaStream){
  //     this.mediaStream.getTracks().forEach(track => {
  //       if(track.readyState === 'live'){
  //         track.stop();
  //       }
  //     })
  //   }
  // }

  // readySocket(){

  //   this.socketConnection = new WebSocket(environment.config.LIVE.ENCODER_BASE_URL + '?key=' + this.streamKey);

  //   this.socketConnection.addEventListener('open', () => { this.socket_ready = true; this.socket_closed = false;});
  //   this.socketConnection.addEventListener('close', () => { this.socket_ready = false; this.socket_closed = true; this.stopLive() });
  //   // this.socketConnection.addEventListener('error', (error) => console.log(error))
  //   // this.socketConnection.addEventListener('message', (message) => console.log(message));
  // }

  // goLive(){

  //   this.live_loading = true;

  //   if(this.socket_ready){

  //     this.live = true;
  //     this.broadcast();
  //     this.live_loading = false;
  //   }
  //   else{

  //     let interval = setInterval(() => {
        
  //       if(this.socket_ready){

  //         this.live = true;
  //         this.broadcast();
  //         this.live_loading = false;
  //         clearInterval(interval);
  //       }
  //       else{

  //         if(this.socket_closed){
  //           this.readySocket();
  //         }
  //       }
  //     }, 5000)
  //   }
  // }

  // broadcast(){

  //   let stream = null;
  //   if(this.streamPreviewer.nativeElement.captureStream)
  //     stream = this.streamPreviewer.nativeElement.captureStream(30);
  //   else if (this.streamPreviewer.nativeElement.mozCaptureStream)
  //    stream = this.streamPreviewer.nativeElement.mozCaptureStream(30); 
  //   else
  //     console.error("stream capture is not supported");

  //   let outputStream = new MediaStream();
  //   stream.getTracks().forEach(track => outputStream.addTrack(track));

  //   this.mediaRecorder = new MediaRecorder(outputStream, {
  //     mimeType: 'video/webm',
  //     videoBitsPerSecond: 3000000
  //   })

  //   this.mediaRecorder.addEventListener('dataavailable', e => {
  //     this.socketConnection.send(e.data)
  //   })
  //   this.mediaRecorder.addEventListener('stop', e => this.stopLive())

  //   this.mediaRecorder.start(300);
  //   this.startTimer();

  //   // changeStatus
  //   this.initData(null, this.liveService.startLiveSession(this.liveEvent._id));
  // }

  // endLive(){

  //   if(window.confirm("This will end your live session, Are you sure?")){
      
  //     this.stopLive();
  //     this.initData(null, this.liveService.endLiveSession(this.liveEvent._id));
  //     console.log("navigating");
  //     this.router.navigate(["/user-account", "live"]);
  //     console.log("ended navigation")
  //     return true;
  //   }

  //   return false;
  // }

  // stopLive(){

  //   if(this.mediaRecorder && this.mediaRecorder.state === 'recording')
  //     this.mediaRecorder.stop();

  //   this.socketConnection.send('close');
  //   this.socketConnection.close();

  //   this.stopTimer();

  //   this.live = false;
  // }

  // canDeactivate(): Promise<boolean> {

  //   var canDeactivate = true;

  //   if(this.live)
  //     canDeactivate = this.endLive();

  //   if(canDeactivate)
  //     this.freeStream();

  //   return new Promise(resolve => resolve(canDeactivate));
  //   // return new Promise(resolve => resolve(true));
  // }

  // startTimer(){
  //   this.interval = setInterval(() => {
  //     this.timer++;
  //   }, 1000)
  // }

  // stopTimer(){
  //   clearInterval(this.interval)
  // }

  // formatTimer(){

  //   var left = this.timer;
  //   const hours = Math.floor(left / 3600);
  //   left -= hours * 3600;
  //   const minutes = Math.floor(left / 60);
  //   left -= minutes * 60;
  //   const seconds = left;

  //   return hours + ":" + minutes + ":" + seconds;
  // }

  // sendChat() {
  //   this.new_comment.user_id = this.tokenService.user;
  //   this.new_comment.video_id = this.liveEvent;
  //   this.commentService.createVideoComment(this.new_comment).subscribe(
  //     data => {

  //       // for notification
  //       const notification = new Notify();
  //       notification.sender = {_id: this.user._id, avatar_card: this.user.avatar_card, avatar_color: this.user.avatar_color, full_name: this.user.full_name}; // Avatar needed for notification
  //       notification.receiver = this.liveEvent.user_id;
  //       notification.type = 'COMMENT';
  //       notification.comment = data;
  //       notification['comment_content'] = this.new_comment.comment;
  //       notification['is_a_live'] = true;
  //       notification['live_id'] = this.liveEvent._id;

  //       this.notificationService.createNotification(notification).subscribe(
  //         result => {
  //           this.new_comment = new Comment();
  //         }, error => {
  //           console.log(error);
  //         }
  //       );
  //     }, error => {
  //       console.log(error);
  //     }
  //   );
  // }

  // getLiveComment(live_id: string) {
  //   this.commentService.getLiveChats(live_id).subscribe(
  //     data => {
  //       this.chats = data;
  //     }, error => {
  //       console.log(error);
  //     }
  //   );
  // }

  // updateVideoLike(live: Video, param: string) {

  //   if (param == 'like') {

  //     if(!this.user.liked_videos){
  //       this.user.liked_videos = [];
  //     }

  //     if (this.user.liked_videos.indexOf(live._id) >= 0) {

  //       live.meta.likes = live.meta.likes - 1;
  //       this.liveEvent.is_liked = false;
  //       this.user.liked_videos.splice(this.user.liked_videos.indexOf(live._id), 1);
  //     }
  //     else {

  //       live.meta.likes = live.meta.likes + 1;
  //       this.liveEvent.is_liked = true;
  //       this.user.liked_videos.push(live._id);
  //     }

  //     if (this.user.disliked_videos && this.user.disliked_videos.indexOf(live._id) >= 0) {

  //       live.meta.dislikes = live.meta.dislikes - 1;
  //       this.liveEvent.is_disliked = false;
  //       this.user.disliked_videos.splice(this.user.disliked_videos.indexOf(live._id), 1);
  //     }
  //   }
  //   else if (param == 'dislike') {

  //     if(!this.user.disliked_videos){
  //       this.user.disliked_videos = [];
  //     }

  //     if (this.user.disliked_videos.indexOf(live._id) >= 0) {

  //       live.meta.dislikes = live.meta.dislikes - 1;
  //       this.liveEvent.is_disliked = false;
  //       this.user.disliked_videos.splice(this.user.disliked_videos.indexOf(live._id), 1);
  //     }
  //     else {

  //       live.meta.dislikes = live.meta.dislikes + 1;
  //       this.liveEvent.is_disliked = true;
  //       this.user.disliked_videos.push(live._id);
  //     }

  //     if (this.user.liked_videos && this.user.liked_videos.indexOf(live._id) >= 0) {

  //       live.meta.likes = live.meta.likes - 1;
  //       this.liveEvent.is_liked = false;
  //       this.user.liked_videos.splice(this.user.liked_videos.indexOf(live._id), 1);
  //     }
  //   }

  //   this.initData(null, this.liveService.updateVideo(live));
  //   this.initData(null, this.userService.updateUser(this.user, ["liked_videos", "disliked_videos"]));
  // }

  // share(){

  //   this.showShareModal();
  // }

  // showShareModal(){

  //   if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
  //   $("#add_share_modal").addClass("opened");
  //   $("#add_share_form").addClass("show");
  // }

  // hideShareModal(){

  //   this.renderer.removeClass(document.body, 'overlay');
  //   $("#add_share_modal").removeClass("opened");
  //   $("#add_share_form").removeClass("show");
  // }




  // -----------------------------------------------------------------------
  // New live code
  // -----------------------------------------------------------------------

  public liveEvent: Video = new Video();

  private mediaStream: any;
  private requestAnimation: any;
  private mediaRecorder: any;

  public got_media: boolean = false;
  public socket_ready: boolean = false;
  private socket_closed: boolean = true;
  public live: boolean = false;
  public live_loading: boolean = false;

  public streamKey: string = "";

  // View
  public error: boolean = false;
  public error_message: string = "";
  public timer: number = 0;
  private interval = null;
  
  @ViewChild('streamPreviewer', {static: true}) streamPreviewer: ElementRef;

  private socketConnection: any;

  public chats: Comment[] | any = [];
  public new_comment: Comment = new Comment();
  public user: User = new User();
  public show_live_chat: boolean = true;

  public show_more: boolean = false;

  constructor(private elementRef: ElementRef,
    private tokenService: TokenService,
    private liveService: VideoService,
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private commentService: CommentService,
    private notificationService: NotifyService,
    private userService: UserService,
    private renderer: Renderer2
  ) {
    super();
  }

  ngOnInit() {
    this.route.params.subscribe(
      params => {
        this.initData(this.liveEvent, this.liveService.getLive(params.live_id), () => {

          if(this.liveEvent.user_id != this.tokenService.user._id){
            alert("You don't have permission to broadcast in this Live. Please create your own Live event!");
            this.router.navigate(['/', 'live']);
            return;
          }

          this.preview();
        });
      });
  }

  async canDeactivate(): Promise<boolean> {
    if(this.mediaStream){
      this.mediaStream.getTracks().forEach(track => {
        if (track) track.stop();
      })
    }

    return true;
  }

  async preview() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      })
    }
    catch(error) {

      this.error = true;

      switch(error.name){
        case 'NotAllowedError':
          this.error_message = "Error accessing your camera and/or microphone device. To use Live, you must allow your browser to access those devices.";
          break;
        default:
          this.error_message = error.message
      }
    }
    
    if(this.mediaStream){

      this.got_media = true;

      this.streamPreviewer.nativeElement.srcObject = this.mediaStream;
      this.streamPreviewer.nativeElement.play();
    }
  }

}
