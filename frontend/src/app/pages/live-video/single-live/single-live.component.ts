import { Component,OnChanges, Renderer2, OnInit, OnDestroy, ElementRef, ViewChild, ViewEncapsulation, HostListener, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { VideoService } from '../../shared/services/video.service';
import { ProductService } from '../../shared/services/product.service';
import { UserService } from '../../shared/services/user.service';
import { TokenService } from '../../shared/authentication/token.service';
import { NotifyService } from '../../shared/services/notify.service';
import { ChatService } from '../../shared/services/chat.service';
import { CommentService } from '../../shared/services/comment.service';
import { PaymentService } from '../../shared/services/payment.service';

import { Channel } from '../../shared/models/channel';
import { Video } from '../../shared/models/video';
import { Product } from '../../shared/models/product';
import { User } from '../../shared/models/user';
import { Comment } from '../../shared/models/comment';
import { Notify } from '../../shared/models/notify';

import { CommonComponent } from '../../shared/mock/component';
import 'rxjs/add/observable/interval';
import { Observable, of} from 'rxjs';
import videojs from 'video.js'
import('videojs-dvr')

import { environment } from '../../../../environments/environment';

declare var $: any;
declare var window: any;

// New live code
import * as twilioVideo from 'twilio-video';
import * as assert from 'assert';
import { ThrowStmt } from '@angular/compiler';

@Component({
	selector: 'pft-single-live',
	templateUrl: './single-live.component.html',
  styleUrls: ['./single-live.component.css'],
	encapsulation: ViewEncapsulation.None
})
export class SingleLiveComponent extends CommonComponent implements OnInit, OnDestroy {

	@ViewChild('livePlayer', {static: true}) livePlayer: ElementRef;
  @ViewChild('chatElement') chatElement: any;
  @ViewChild('chatDisplay') private chatDisplay: ElementRef;
  @ViewChild("likee") span: ElementRef;
  @ViewChild("dislikee") span2: ElementRef;
	private options = {
      fluid: true,
      aspectRatio: "16:9",
      autoplay: true,
      sources: [{
          src: environment.config.LIVE.HLS_BASE_URL,
          type: "application/x-mpegURL",
      }]
  };
  player: videojs.Player;

  public active: boolean = false;
  public ready: boolean = false;  
  public complete: boolean = false;
  public timer: number = 0;
  public late_timer: number = 0;
  public start_live_timer: number = 0;
	public live: Video = new Video();
	public similar_lives: Video[] = [];
  public used_products: Product[] = [];

  public chats: Comment[] | any = [];
  public new_comment: Comment = new Comment();
  public user: User = new User();
  public remoteuser: any;
  public show_live_chat: boolean = true;
  public show_live_participants: boolean = true;
  public live_url: string = "";
  public user_subscriptions: any[] = [];
  // public user_playlists: Playlist[] = [];
  // public new_playlist: Playlist = new Playlist();
  // public playlist_success_message: string = "";
  // public playlist_warning_message: string = "";
  // public playlist_error_message: string = "";
  public playlist_add_progress: number = 0;

  public flag_success_message: string = "";
  public flag_warning_message: string = "";
  public flag_error_message: string = "";
  public flag_add_progress: number = 0;
  public stream;
  public screenTrack;
  public activeRoom: any;
  public live_flags: any = {
    inappropriate: false,
    copyrighted: false,
    comment: "",
    video: null,
    channel: null
  };

  public video_info = {title: '', description: ''};

  public show_more: boolean = false;

  // new live code *************************************************************************
  public participantCount:number = 1;
  public videoLikes:number = 1;
  public videoDislikes:number = 1;
  public likeDislike:any;
  public roomData: any;
	public showCoachAvatar: boolean = false;
  public showParticipantAvatar: boolean = false;
  public deactivateWebCam: boolean = false;
  public audioMuted: boolean = false;
  public liveCompleted: boolean = false;
  public liveLoading: boolean = false;
  public livePlaying: boolean = true;
  public liveError: boolean = false;
  public localParticipant: any;
  public isHost: boolean = true;
  public loading: boolean = false;
  public reloaduser: boolean = false;
  public muteall:boolean = false;
  public late:boolean = false;
  public login:boolean = false;
  public remoteuserSubscription:boolean = false;
  public roomfull:boolean = false;
  public disableButton:boolean = false;
  public hostSid:string = '';
  
  // end new live code *********************************************************************

	constructor(
		private route: ActivatedRoute,
    private liveService: VideoService,
    private productService: ProductService,
		private userService: UserService,
    private notificationService: NotifyService,
    private paymentService: PaymentService,
    private renderer: Renderer2,
    private http: HttpClient,
    private elementRef: ElementRef,
    private chatService: ChatService,
    private tokenService: TokenService,
    private commentService: CommentService,
    private router: Router,
    private changeRef: ChangeDetectorRef
    ) {
		super();
	}

	ngOnInit() {
    this.router.events.subscribe(value => {
      if(value instanceof NavigationEnd){
        let endurl = this.router.url.toString();
        let url_array = endurl.split("/");
        if(url_array[2] == undefined || url_array[2] == null){
          if(this.tokenService.user && this.tokenService.user._id) {
            window.location.href = endurl;
          }
        }
      }
        
      });
    if(this.tokenService.user && this.tokenService.user._id) {
      this.user = this.tokenService.user;
      this.login = true;
    }else{
      this.login = false;
      this.router.navigateByUrl('/login');
      //this.router.navigate(['/live' ]);
    }
    if(this.login == true){
		this.route.params.subscribe(
			params => {
        this.live_url = window.location.href;
        const connected_user = this.tokenService.decodeUserToken();
        if(connected_user && connected_user._id){
          this.initData(this.user, this.userService.getConnected());
          this.initData(this.user_subscriptions, this.userService.getSubscriptions());
        }
        this.chats = Observable.interval(1000)
        .subscribe((val) => {
           this.getLiveComment(params["live_id"]);
          });
       
    //     this.options.sources[0].src += "/" + params.live_id + ".m3u8"; // commented, replaced by twilio video live

        this.initData(this.live, this.liveService.getLive(params["live_id"]), () => {
          this.likeDislike = Observable.interval(5000)
          .subscribe((val) => { this.getLiveLikeDislike(params["live_id"]) });
        // New live code *************************************************************************
          this.liveService.checkRoom(this.live.live_info.roomName).subscribe(
            async room_status => {
              this.liveService.getConnectedUser(this.live.live_info.roomName).subscribe(
                async data => {
                  if(this.live.live_info.maxNoPeople <= data['connected_users']){
                    this.livePlaying = false;
                    this.ready = false;
                    this.complete = false;
                    this.late = false;
                    this.active = false;
                    this.roomfull = true;
                    return false;
                  }else{
                      if(this.tokenService.user._id == this.live.user_id){
                        this.isHost = true;
                        this.startStartLiveTimer();
                      }else{
                        this.isHost = false;
                        if (this.live.price && this.live.price > 0 /*&& this.live.live_info && this.live.live_info.status == 'LIVE'*/) { // I think this status will be already in LIVE (so no need to check)
                          console.log(this.isInPurchasedVideo(this.live._id));
                          if (this.isInPurchasedVideo(this.live._id) == false) { 
                            // Just for Test Purchased Video
                            // this.paymentService.updatePurchaseVid(this.tokenService.user._id, this.live._id).subscribe(
                            //   data => {
                            //     console.log(data);
                            //   }, error => {
                            //     console.log(error);
                            //   }
                            // );
                            this.router.navigate(['/payment/live/' + this.live._id]);
                            return false;
                          }
                        }
                      }
              if ((room_status.status == 'unavailable' || room_status.status == 'UPCOMMING') && this.tokenService.user._id == this.live.user_id) {
                await this.liveService.createRoom(this.live.live_info.roomName,this.live.live_info.maxNoPeople).subscribe(
                  room => {
                    this.reloaduser = true;
                  }, error => {
                    console.log(error)
                    this.liveError;
                  });
              }else if((room_status.status == 'unavailable' || room_status.status == 'UPCOMMING') && this.tokenService.user._id != this.live.user_id){
                this.livePlaying = false;
                this.liveCompleted = false;
                this.loading = false;
                const now = new Date();
                this.live.live_info.start = new Date(this.live.live_info.start);
                //console.log(this.live.live_info.start +'___'+now);
                if(this.live.live_info && this.live.live_info.start && (this.live.live_info.start.getTime() > now.getTime())){
                  console.log('dsdsd');
                  this.ready = true;
                  this.late = false;
                  this.timer = Math.floor((this.live.live_info.start.getTime() - now.getTime()) / 1000);
                // console.log(this.timer);
                  this.startTimer(); // commented, replaced by twilio video live
                  this.reTryPlaying();
                }else{
                if(this.live.live_info && this.live.live_info.status === 'COMPLETE'){
                  this.ready = false;
                  this.complete = true;
                  this.late = false;
                  this.active = false;
                }else{
                  this.late = true;
                  this.ready = false;
                  this.late_timer = Math.floor((now.getTime() - this.live.live_info.start.getTime()) / 1000);
                  //console.log(this.late_timer);
                  this.startLateTimer(); // commented, replaced by twilio video live
                  this.reTryPlaying(); // commented, replaced by twilio video live
                }
              }
                return;
              }
              if (room_status.status == 'COMPLETE') {
                this.livePlaying = false;
                this.liveLoading=true;
                this.liveCompleted = true;
                this.loading = false;
                this.ready = false;
                this.complete = true;
                this.late = false;
                this.active = false;
                return;
              }
            }
              this.liveService.generateToken(this.live.live_info.roomName).subscribe(
                async data => {
                  this.livePlaying = true;
                  this.live.live_info.status = 'LIVE'
                  this.initData(null, this.liveService.updateVideo(this.live))
                  let that = this;
                  twilioVideo.createLocalTracks({
                    audio: that.tokenService.user && that.tokenService.user._id == that.live.user_id ? true : true,
                    video: that.tokenService.user && that.tokenService.user._id == that.live.user_id ? true : true
                  }).then(localTracks => {
                    return twilioVideo.connect(data['roomToken'], {
                    name: this.live.live_info.roomName,
                    tracks: localTracks
                    });
                  }).then(async room => {
                    if(that.tokenService.user && that.tokenService.user._id == that.live.user_id){
                      this.isHost = true;
                      that.showParticipantAvatar = true;
                    }else{
                      this.isHost = false;
                      that.showParticipantAvatar = false;
                    }
                    console.log(`Connected to Room: ${room.name}`);
                    this.activeRoom = room;
                    // Log your Client's LocalParticipant in the Room
                    that.localParticipant = room.localParticipant;

                    console.log(`Connected to the Room as LocalParticipant "${that.localParticipant.identity}"`);

                    function trackPublishedLocal(publication) {
                      console.log(`Published LocalTrack: ${publication.track}`);
                      console.log(publication.track);
                      if (that.live.user_id == that.localParticipant.identity) {
                        document.getElementById('coach-media-div').appendChild(publication.track.attach());
                      }
                    }

                    function handleTrackDisabled(track, participant) {
                      track.on('disabled', (track_param) => {
                        if(track_param.kind == 'video' && document.getElementById('coach-media-div') && participant && that.live.user_id == participant.identity){ 
                          /*document.getElementById('coach-media-div').style.visibility = "hidden";*/ that.showCoachAvatar = true; console.log("if d condition");
                        } else {
                          console.log("else d condition");
                        }
                        // if(document.getElementById('remote-media-div') && participant && that.live.user_id != participant.identity) document.getElementById('remote-media-div').style.visibility = "hidden"

                        if (document.getElementById("remote-media-div")) {
                          var x = document.getElementById("remote-media-div");
                          var video = x.getElementsByTagName("video");
                          var i;
                          for (i = 0; i < video.length; i++) {
                            console.log("video disable for: " + i + " - " + video[i].getAttribute("data-id"));
                            if(video[i].getAttribute("data-id") == participant.identity) {

                              // that.showParticipantAvatar = true;
                            }
                          }

                          var audio = x.getElementsByTagName("audio");
                          var i;
                          for (i = 0; i < audio.length; i++) {
                            console.log("audio disable for: " + i + " - " + video[i].getAttribute("data-id"));
                          }
                        }
                      });

                      track.on('enabled', (track_param) => {
                        if(track_param.kind == 'video' && !document.getElementById('coach-media-div') && participant && that.live.user_id == participant.identity) {that.showCoachAvatar = false; /*that.changeRef.detectChanges(); setTimeout(() => {}); document.getElementById('coach-media-div').style.visibility = "visible";*/ console.log("if e condition");} else { console.log("else e condition"); }
                        // if(document.getElementById('remote-media-div') && participant && that.live.user_id == participant.identity) document.getElementById('remote-media-div').style.visibility = "visible"
                        // that.showParticipantAvatar = false;
                        if (document.getElementById("remote-media-div")) {
                          var x = document.getElementById("remote-media-div");
                          var video = x.getElementsByTagName("video");
                          var i;
                          for (i = 0; i < video.length; i++) {
                            console.log("++ video active for: " + i + " - " + video[i].getAttribute("data-id"));
                            if(video[i].getAttribute("data-id") == participant.identity) {

                              // that.showParticipantAvatar = true;
                            }
                          }

                          var audio = x.getElementsByTagName("audio");
                          var i;
                          for (i = 0; i < audio.length; i++) {
                            console.log("++ audio active for: " + i + " - " + video[i].getAttribute("data-id"));
                          }
                        }
                      });
                    }

                    function trackPublished(publication, participant) {
                      console.log(`RemoteParticipant ${participant.identity} published a RemoteTrack: ${publication}`);
                      assert(!publication.isSubscribed);
                      assert.equal(publication.track, null);

                      publication.on('subscribed', track => {
                        console.log(`LocalParticipant subscribed to a RemoteTrack: ${track}`);
                        assert(publication.isSubscribed);
                        assert(publication.track, track);
                        if (participant.identity == that.live.user_id) {
                          if(track.kind == 'video'){
                            if(that.hostSid == ''){
                              that.hostSid = track.sid;
                              if(document.getElementById(participant.identity) == undefined){
                                const coachvideo = document.createElement('div');
                                coachvideo.setAttribute("id", participant.identity);
                                coachvideo.appendChild(publication.track.attach());
                                document.getElementById('coach-media-div').prepend(coachvideo);
                              }else{
                                const coachvideo = document.getElementById(participant.identity);
                                const domEle = publication.track.attach();
                                coachvideo.appendChild(domEle);
                                document.getElementById('coach-media-div').prepend(coachvideo);
                              }
                            }else{
                              const sharescreen = document.createElement('div');
                              sharescreen.setAttribute("id", participant.sid);
                              sharescreen.setAttribute("class", 'fullwidth');
                              sharescreen.appendChild(publication.track.attach());
                              const coachvideo = document.getElementById(participant.identity);
                              coachvideo.style.display = 'none';
                              document.getElementById('coach-media-div').appendChild(sharescreen);
                             // console.log(that.disableButton);
                            }
                          }else{
                            document.getElementById('coach-media-div').appendChild(publication.track.attach());
                          }
                          
                        } else if(that.showParticipantAvatar == true) {

                           that.userService.getUserDetail(participant.identity).subscribe(
                            data => {
                            that.userIsSubscribedToChannelByUser(participant.identity);
                           const domEle = track.attach();
                           if(document.getElementById(participant.identity) == undefined){
                            const viewervideo = document.createElement('div');  
                            viewervideo.setAttribute("class", 'pt-widget');
                            viewervideo.setAttribute("id", participant.identity);
                            domEle.setAttribute('data-id', participant.identity);
                            viewervideo.appendChild(domEle);
                            document.getElementById('remote-media-div').prepend(viewervideo);
                           }else{
                            const viewervideo = document.getElementById(participant.identity);
                            domEle.setAttribute('data-id', participant.identity);
                            viewervideo.appendChild(domEle);
                            document.getElementById('remote-media-div').prepend(viewervideo);
                           }
                           const viewername = document.createElement('div');
                            viewername.setAttribute("id", 'user_identity_'+participant.identity);
                            viewername.setAttribute("class", 'pt-lst');
                            const getviewerdiv = document.getElementById(participant.identity);
                                getviewerdiv.appendChild(viewername);
                           if(data.full_name != undefined && track.kind == 'video'){
                            const getviewerdiv = document.getElementById('user_identity_'+participant.identity);
                            const viewername = document.createElement('h5');
                            let sub = '';
                            if(that.live && that.live.channel_id && that.live.channel_id._id){
                              that.userService.getSubscriptionsbyid(participant.identity,that.live.channel_id._id).subscribe(
                                  data2 => {
                                  if(data2['message'] === true){
                                    sub = '<span>. Subscribed</span>';
                                  }
                                viewername.innerHTML = data.full_name+' '+sub;
                                getviewerdiv.prepend(viewername);
                              });
                            }
                          }else if(data.full_name != undefined && track.kind == 'audio'){
                            const viewername = document.getElementById('user_identity_'+participant.identity);
                              const viewerbutton = document.createElement('div');
                              viewerbutton.innerHTML = '<span><img id="'+track.sid+'" style="height: 25px; cursor: pointer;" src="assets/images/mic.png"> </span>';
                              viewerbutton.addEventListener('click', (e) => {
                                that.muteAudio(track);
                              });
                              viewername.appendChild(viewerbutton);
                              const getviewerdiv = document.getElementById(participant.identity);
                              getviewerdiv.appendChild(viewername);
                           }
                        }, error => {
                          console.log('ok');
                          console.log(error);
                        }
                      );
                        }
                      });
                      publication.on('unsubscribed', track => {
                        const coachvideo = document.getElementById(participant.identity);
                        if (that.live.user_id == participant.identity) {
                          document.getElementById(participant.sid)?.remove();
                          if(coachvideo != undefined){
                           // that.disableButton = false;
                            coachvideo.style.display = 'block';
                          }
                        }
                       // console.log(that.disableButton);
                        console.log(`LocalParticipant unsubscribed from a RemoteTrack: ${track}`);
                        assert(!publication.isSubscribed);
                        assert.equal(publication.track, null);
                      });
                    }

                    function participantConnected(participant) {
                            //if(last_total_participants != undefined){
                              that.participantCount = that.participantCount +1;
                           // }
                          
                      participant.tracks.forEach(publication => {
                        console.log(`Participant connected: ${participant.identity}`);
                        
                        trackPublished(publication, participant);
                      });

                      participant.on('trackPublished', publication => {
                        trackPublished(publication, participant);
                      });

                      participant.on('trackUnpublished', publication => {
                        console.log(`RemoteParticipant ${participant.identity} unpublished a RemoteTrack: ${publication}`);
                      });
                    }

                    // Access the already published LocalTracks.
                    room.localParticipant.tracks.forEach(trackPublishedLocal);

                    // Log any Participants already connected to the Room
                    room.participants.forEach(participant => {
                      console.log(`Participant "${participant.identity}" is connected to the Room`);
                      
                      participant.tracks.forEach(publication => {
                        if (publication.isSubscribed) {
                           handleTrackDisabled(publication.track, participant);
                        }
                        publication.on('subscribed', () => {
                           handleTrackDisabled(publication.track, participant);
                        });
                      });
                    });

                    room.participants.forEach(participantConnected);

                    room.on('participantConnected', participantConnected);
                    room.on('participantDisconnected', participant => {
                      console.log(`Participant disconnected: ${participant.identity}`);
                      that.participantCount = that.participantCount - 1;
                      // console.log(this.participantCount);
                      if (that.live.user_id == participant.identity) {
                        that.liveService.getLive(params["live_id"]).subscribe(
                          data => {
                          if (data['live_info']['status'] == 'COMPLETE') {
                            that.liveCompleted = true;

                            that.ngOnDestroy();

                            //data['channel_id'] && data['channel_id']['_id'] ? that.router.navigate(['/channels/' + data['channel_id']['_id'] ]) : that.router.navigate(['/live']);
                          }
                        }, error => {
                          console.log('ok2');
                          console.log(error)
                        })
                      }else{
                        document.getElementById(participant.identity)?.remove();

                      }
                    });                    
                    this.loading = false;
                    this.roomData = room;
                  }, error => {
                    console.error(`Unable to connect to Room: ${error}`);
                  });

                }, error => {
                  console.log('ok3');
                  console.log(error)
                });

            }, error_status => {
              console.log('ok4');
              console.log(error_status)
            });
          });
          // End new live code *************************************************************************

          if(this.live._id) {
            console.log(this.live);
            this.live.description && this.live.description.length > 260 ? this.show_more = false : this.show_more = true;
            let viewers = this.live.meta.views >= 0 ? (this.live.meta.views) : 0;
            if(this.login == true){
              this.initData(null, this.liveService.updateViewers(this.live, this.tokenService.user._id));
            }

            this.chatService.getViewer().subscribe(
              data => {
                if (data.viewer && data.viewer.length) {
                  data.viewer.map(current => {
                    if (current.live_id == this.live._id) {
                      this.live.meta.views = current.viewers;
                    }
                  });
                }
              }, error => {
                console.log(error);
              }
            );

            this.chatService.getLikes().subscribe(
              data => {
                if (data.likes && data.likes.length) {
                  data.likes.map(current => {
                    if (current.live_id == this.live._id) {
                     // this.live.meta.likes = current.likes;
                      //this.live.meta.dislikes = current.dislikes;
                    }
                  });
                }
              }, error => {
                console.log(error);
              }
            );

            this.chatService.getLiveChat().subscribe(
              data => {
                if (data.chat && data.chat.length) {
                  data.chat.map(current => {
                    if (current.live_id == this.live._id) {
                      this.chats.push(current);
                    }
                  });
                }
              }, error => {
                console.log(error);
              }
            );
          }
          // metadata
          // this.live.is_favorite = this.user.favorite_videos.indexOf(this.live._id) > -1;
          if(this.user.liked_videos){
            this.live.is_liked = this.user.liked_videos.indexOf(this.live._id) > -1;
            this.live.is_disliked = this.user.disliked_videos.indexOf(this.live._id) > -1;
          }
          // this.live.is_to_watch_later = this.user.watch_later_videos.map(current => current._id || current).indexOf(this.live._id) > -1;
        })
				
				this.initData(this.similar_lives, this.liveService.getSimilarLives(params["live_id"]));
				// this.initData(this.used_products, this.productService.liveUsedProducts(params["id"]));
      })
    }
	}
  detachRemoteTrack(track,participant: twilioVideo.RemoteParticipant) {
    console.log(participant);
        track.detach().forEach(el => el.remove());
         //this.participantsChanged.emit(true);
  }
  stopPresenting(){
    this.screenTrack = new twilioVideo.LocalVideoTrack(this.stream.getTracks()[0]);
    this.activeRoom.localParticipant.unpublishTrack(this.screenTrack);
    this.disableButton = false;
  }
  present() {
        // share screen
        const mediaDevices = navigator.mediaDevices as any;
        mediaDevices.getDisplayMedia().then(stream => {
            this.stream = stream;
            this.screenTrack = new twilioVideo.LocalVideoTrack(stream.getTracks()[0]);
            this.disableButton = true;
            this.activeRoom.localParticipant.publishTrack(this.screenTrack, {
                name: 'screenshare'
            });
            this.screenTrack.once('stopped', () => {
              this.disableButton = false;
                this.activeRoom.localParticipant.unpublishTrack(this.screenTrack);
            });
        }, _ => {
            console.log('Error Sharing Screen');
        });

}
showConfirmationModal(live: Video, index: number) {
  if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
  $(".form_popup#login_form_popup").addClass("opened");
  $("#login_form_popup .login_form").addClass("show");
}
showUserConfirmationModal() {
  if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
  $(".form_popup#login_form_popup2").addClass("opened");
  $("#login_form_popup2 .login_form").addClass("show");
}
hideConfirmationModal(){
  this.renderer.removeClass(document.body, 'overlay');
  $(".form_popup").removeClass("opened");
  $(".login_form").removeClass("show");
}
  startTimer(){
    var interval = setInterval(() => {

      this.timer--;
      if(this.timer === 0){
        clearInterval(interval);
        this.late = true;
        this.ready = false;
      }
    }, 1000)
  }

  startLateTimer(){

    var interval = setInterval(() => {

      this.late_timer++;
    }, 1000)
  }
  startStartLiveTimer(){

    var interval = setInterval(() => {

      this.start_live_timer++;
    }, 1000)
  }
  async reTryPlaying(){
    const success = await this.tryPlaying();
    if(success){
      //return true;
    }

    var interval = setInterval(async () => {
      const success = await this.tryPlaying();
      this.liveService.checkRoom(this.live.live_info.roomName).subscribe(
        async room_status => {
          if(room_status.status == 'LIVE'){
            this.active = true;
            this.ready = true;
            clearInterval(interval);
            this.ngOnInit();
          }
        });
    }, 5000)
  }

  async tryPlaying(){
          this.active = false;
           const result =  this.initData(null, this.liveService.getLive(this.live._id)); 
           return result;
  }

	ngOnDestroy() {
    if(this.tokenService.user && this.tokenService.user._id){
    console.log(this.live);
    if(this.live != undefined && this.live.meta.views != undefined){
      //let viewers = this.live.meta.views && this.live.meta.views > 0 ? (this.live.meta.views - 1 ) : 0;
     // this.initData(null, this.liveService.updateViewers(this.live, viewers));
    }
    // new live code
    // making sure we are disabling cam and unpublish track before leaving the page 
    if(this.roomData != undefined && this.roomData != null){
      this.roomData.localParticipant.videoTracks.forEach(publication => {
        publication.unpublish();
        publication.track.disable();
        publication.track.stop();
        publication.track.detach();      
      });
    }
    if(this.tokenService.user._id == this.live.user_id){
     this.roomData.disconnect();
    setTimeout(()=>{
        this.router.navigate(['/user-account/live']);
      },2000);
      }else{
       // if(this.ready != undefined && this.ready != null && this.complete != undefined && this.complete != null && this.late != undefined && this.late != null && this.active != undefined && this.active != null && this.livePlaying != undefined && this.livePlaying != null)
        this.ready = false;
        this.complete = true;
        this.late = false;
        this.active = false;
        this.livePlaying = false;
       // window.location.reload();
     }
   
    
  }
  }
  // video tools
  // addToPlaylist(){

  //   this.playlist_success_message = "";
  //   this.playlist_warning_message = "";
  //   this.playlist_error_message = "";
  //   this.playlist_add_progress = 0;

  //   if(this.user_playlists.length == 0){
  //     this.initData(this.user_playlists, this.playlistService.getMyPlaylists());
  //   }

  //   this.showAddPlaylistModal();
  // }

  share(){

    this.showShareModal();
  }

  flag(){

    this.flag_success_message = "";
    this.flag_warning_message = "";
    this.flag_error_message = "";
    this.flag_add_progress = 0;

    this.showFlagModal();
  }

  // createAndAdd(){

  //   this.playlist_success_message = "";
  //   this.playlist_warning_message = "";
  //   this.playlist_error_message = "";

  //   if(this.new_playlist.title){

  //     this.new_playlist.videos.push(this.live);
  //     this.playlist_add_progress = 10;

  //     this.initData(null, this.playlistService.createPlaylist(this.new_playlist), () => {

  //       this.playlist_add_progress = 100;
  //       this.user_playlists.unshift(JSON.parse(JSON.stringify(this.new_playlist)));

  //       this.playlist_success_message = "Video added to playlist '" + this.new_playlist.title + "'";
  //       setTimeout(() => this.playlist_add_progress = 0, 1000);
        
  //       this.new_playlist = new Playlist();
  //     })
  //   }
  // }

  // addToExisting(playlist: Playlist, playlist_id: string){

  //   this.playlist_success_message = "";
  //   this.playlist_warning_message = "";
  //   this.playlist_error_message = "";

  //   // The code below resolve the add of playlist error when switching from a video to another one
  //   // (this code can be improved)
  //   // I think the probleme is the binding caused by "playlist" variable
  //   // as html and component update it
  //   this.playlistService.getPlaylistDetail(playlist_id).subscribe(
  //     playlist_data => {

  //       $(".lg-in").scrollTop(0);

  //       if(!playlist_data.videos){
  //         playlist_data.videos = [];
  //       }

  //       const video_index = playlist_data.videos.map(current => current._id).indexOf(this.live._id);

  //       if(video_index > -1){
  //         this.playlist_warning_message = "The video is already in playlist '" + playlist_data.title + "'";
  //       }
  //       else{

  //         playlist_data.videos.push(this.live);
  //         playlist.videos.push(this.live);
  //         this.playlist_add_progress = 10;

  //         this.initData(null, this.playlistService.updatePlaylist(playlist_data), () => {

  //           this.playlist_add_progress = 100;
  
  //           this.playlist_success_message = "Video added to playlist '" + playlist_data.title + "'";
  //           setTimeout(() => this.playlist_add_progress = 0, 1000);
  //         });
  //       }

  //     }, error => {
  //       console.log(error);
  //   });
  // }

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
    this.initData(null, this.liveService.flag(this.live._id, this.live_flags), () => {

      /*this.live_flags = {
        inappropriate: false,
        copyrighted: false,
        comment: ""
      }*/

      this.flag_add_progress = 50;

      // Hasina Code
      this.live_flags.video = this.live._id;
      if(!this.user.report_history){
        this.user.report_history = [];
      }
      this.user.report_history.push(this.live_flags);
      this.userService.updateUser(this.user, ["report_history"]).subscribe(
        data => {

          this.flag_add_progress = 100;
          this.flag_success_message = "Your reporting has been posted";

          this.live_flags = {
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
    if(this.user && this.user.purchased_videos) {
      this.user.purchased_videos.map((current: any) => {
        if (current == video_id) {
          found = true;
        }
      });
    }
    return found;
  }

  checkMaxParticipants():any{
    let found: boolean = false;
    this.paymentService.checkMaxParticipants(this.tokenService.user._id, this.live._id).subscribe(
      data => {
        if(data['message'] == 'ok'){
          found = true;
        }
        return found;
      }, error => {
        return error;
      }
    );
  }
  
  removeFromWatchLater(live: Video) {
    const video_index = this.user.watch_later_videos.map(current => current._id).indexOf(live._id);
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

  addToWatchLater(live: Video) {
    const video_index = this.user.watch_later_videos.map(current => current._id).indexOf(live._id);
    if (video_index == -1) {
      this.user.watch_later_videos.push(live);
      this.initData(null, this.userService.updateUser(this.user, ["watch_later_videos"]));
    }
  }

  subscribe(){

    if(this.live && this.live.channel_id && this.live.channel_id._id){
      this.initData(null, this.userService.subscribe(this.live.channel_id._id), () => {
        this.live.channel_id.meta.subscribers += 1;
        this.user_subscriptions.push({_id: this.live.channel_id._id});
      });
      this.userService.getChannelByOwner().subscribe(
        data => {
          const notification = new Notify();
          notification.sender = {_id: this.user._id, avatar_card: this.user.avatar_card, avatar_color: this.user.avatar_color, full_name: this.user.full_name}; // Avatar needed for notification
          notification.receiver = this.live.channel_id.owner;
          notification.type = 'SUBSCRIPTION';
          notification.subscription_channel = this.live.channel_id;
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

    if(this.live && this.live.channel_id && this.live.channel_id._id){

      this.initData(null, this.userService.unsubscribe(this.live.channel_id._id), () => {

        const subscription_index = this.user_subscriptions.map(current => current._id).indexOf(this.live.channel_id._id);

        if(subscription_index > -1){

          this.live.channel_id.meta.subscribers -= 1;
          this.user_subscriptions.splice(subscription_index, 1);
        }
      })

      //console.log(this.user_subscriptions);
    }
  }
  userIsSubscribedToChannelByUser(userid){
    if(this.live && this.live.channel_id && this.live.channel_id._id){
      this.userService.getSubscriptionsbyid(userid,this.live.channel_id._id).subscribe(
          data => {
          if(data){

          }
      });
    }
}

  userIsSubscribedToChannel(){
    if(!this.user_subscriptions){
      this.user_subscriptions = [];
    }
    if(this.live && this.live.channel_id && this.live.channel_id._id){
      //console.log(this.user_subscriptions.map(current => current._id).indexOf(this.live.channel_id._id) > -1);
      return this.user_subscriptions.map(current => current._id).indexOf(this.live.channel_id._id) > -1;

    }

    return false;
  }

  addOrRemoveFromFavorites(){
    if(!this.live.is_favorite){
      this.initData(null, this.userService.addToFavorite(this.live._id), () => {
        this.live.is_favorite = true;
      })
    }
    else{
      this.initData(null, this.userService.removeFromFavorite(this.live._id), () => {
        this.live.is_favorite = false;
      })
    }
  }

  addOrRemoveFromWatchLater() {

    if (!this.user.watch_later_videos){
      this.user.watch_later_videos = [];
    }

    const video_index = this.user.watch_later_videos.map(current => current._id || current).indexOf(this.live._id.toString());

    if (video_index < 0) {
      this.user.watch_later_videos.push(this.live);
      this.live.is_to_watch_later = true;
      this.initData(null, this.userService.addToWatchLater(this.live._id));
    }
    else{
      this.user.watch_later_videos.splice(video_index, 1);
      this.live.is_to_watch_later = false;
      this.initData(null, this.userService.removeFromWatchLater(this.live._id));
    }
  }

  updateVideoLike(live: Video, param: string) {
   
    if (param == 'like') {

      if(!this.user.liked_videos){
        this.user.liked_videos = [];
      }

      if (this.user.liked_videos.indexOf(live._id) >= 0) {

        live.meta.likes = live.meta.likes - 1;
      //  this.span.nativeElement.innerHTML = live.meta.likes;
        this.live.is_liked = false;
        this.user.liked_videos.splice(this.user.liked_videos.indexOf(live._id), 1);
      }
      else {
        live.meta.likes = live.meta.likes + 1;
      //  this.span.nativeElement.innerHTML = live.meta.likes;
        this.live.is_liked = true;
        this.user.liked_videos.push(live._id);
      }
      if (this.user.disliked_videos && this.user.disliked_videos.indexOf(live._id) >= 0) {

        live.meta.dislikes = live.meta.dislikes - 1;
      //  this.span2.nativeElement.innerHTML = live.meta.dislikes;
        this.live.is_disliked = false;
        this.user.disliked_videos.splice(this.user.disliked_videos.indexOf(live._id), 1);
      }
    }
    else if (param == 'dislike') {

      if(!this.user.disliked_videos){
        this.user.disliked_videos = [];
      }

      if (this.user.disliked_videos.indexOf(live._id) >= 0) {

        live.meta.dislikes = live.meta.dislikes - 1;
       // this.span2.nativeElement.innerHTML = live.meta.dislikes;
        this.live.is_disliked = false;
        this.user.disliked_videos.splice(this.user.disliked_videos.indexOf(live._id), 1);
      }
      else {

        live.meta.dislikes = live.meta.dislikes + 1;
       // this.span2.nativeElement.innerHTML = live.meta.dislikes;
        this.live.is_disliked = true;
        this.user.disliked_videos.push(live._id);
      }

      if (this.user.liked_videos && this.user.liked_videos.indexOf(live._id) >= 0) {

        live.meta.likes = live.meta.likes - 1;
        //  this.span.nativeElement.innerHTML = live.meta.likes;
        this.live.is_liked = false;
        this.user.liked_videos.splice(this.user.liked_videos.indexOf(live._id), 1);
      }
    }
      
      this.initData(null, this.liveService.updateVideo(live));
      //this.getLiveLikeDislike(live._id);
    this.initData(null, this.userService.updateUser(this.user, ["liked_videos", "disliked_videos"]));
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
  show_hide_participants(){
    if(this.show_live_participants == true){
      this.show_live_participants = false;
      var get_Pdiv = document.getElementById("participant_data");
      get_Pdiv.classList.add("hide");
    }else{
      var get_Pdiv = document.getElementById("participant_data");
      get_Pdiv.classList.remove("hide");
      this.show_live_participants = true;
    }
  }
  sendChat() {
    console.log('chatsent');
    this.new_comment.user_id = this.tokenService.user;
    this.new_comment.video_id = this.live;
    this.commentService.createVideoComment(this.new_comment).subscribe(
      data => {

        // for notification
        const notification = new Notify();
        notification.sender = {_id: this.user._id, avatar_card: this.user.avatar_card, avatar_color: this.user.avatar_color, full_name: this.user.full_name}; // Avatar needed for notification
        notification.receiver = this.live.user_id;
        notification.type = 'COMMENT';
        notification.comment = data;
        notification['comment_content'] = this.new_comment.comment;
        notification['is_a_live'] = true;
        notification['live_id'] = this.live._id;
        console.log('chatsentffff');
        this.getLiveComment(this.live._id);
        this.notificationService.createNotification(notification).subscribe(
          result => {
            this.new_comment = new Comment();
          }, error => {
            console.log(error);
          }
        );
      }, error => {
        console.log(error);
      }
    );
  }
  mute_unmute_all(){
    if(this.muteall == false){
      document.getElementById("mute_unmute").innerHTML = "Unmute all";
      this.roomData.participants.forEach(paticipant => {
        paticipant.audioTracks.forEach(track => {
          const getimage = document.getElementById(track.track.sid);
            if (getimage instanceof HTMLImageElement){
              getimage.src = 'assets/images/mic2.png';
              console.log(track.track);
              track.track.detach();
            }
        });
     });
     this.muteall = true;
     this.audioMuted = true;
    }else{
      document.getElementById("mute_unmute").innerHTML = "Mute all";
      this.roomData.participants.forEach(paticipant => {
        console.log(paticipant.audioTracks);
        paticipant.audioTracks.forEach(track => {
          const getimage = document.getElementById(track.track.sid);
            if (getimage instanceof HTMLImageElement){
              getimage.src = 'assets/images/mic.png';
              track.track.attach();
            }
        });
     });
     this.muteall = false;
     this.audioMuted = false;
    }
  }
  getLiveComment(live_id: string) {
    this.commentService.getLiveChats(live_id).subscribe(
      data => {
        this.chats = data;
       // let messageBody = document.querySelector('#ddd');
       // console.log(messageBody.clientHeight);
       // messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
        //this.chatDisplay.nativeElement.scrollTop = this.chatDisplay.nativeElement.scrollHeight;
       // ScrollChat.scrollTop = ScrollChat.scrollHeight;
      }, error => {
        console.log(error);
      }
    );
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

  addViewer() {
    let d = document.createElement('div');
    d.innerHTML = '<span style="background-color: red; height: 170px; flex: 1;"> </span>';
    document.getElementById('remote-media-container').append(d);
    console.log("append")
  }
  redirectToTipPage(participant:twilioVideo.LocalParticipant) {

  }
  leave(participant:twilioVideo.LocalParticipant){
    document.getElementById(participant.identity)?.remove();
    if(participant.identity == this.tokenService.user._id){
      setTimeout(function(){
        window.location.href = "/live";
      },1500);
    }
  }
  // New code live *************************************************************************
  muteAudio(track:twilioVideo.RemoteAudioTrack) {
    const getimage = document.getElementById(track.sid);
    if (this.audioMuted == false) {
      if (getimage instanceof HTMLImageElement) getimage.src = 'assets/images/mic2.png';
      track.detach();
      // this.roomData.participants.audioTracks.forEach(publication => {
      //   console.log(publication.track.name);
      //   console.log(track.name);
      //   if(publication.track.name == track.name){
      //     console.log(publication.track);
      //     publication.track.disable();
      //   }
      // });
      this.audioMuted = true;
    } else {
      if (getimage instanceof HTMLImageElement) getimage.src = 'assets/images/mic.png';
      track.attach();
      // this.roomData.localParticipant.audioTracks.forEach(publication => {
      //   if(publication.track.name == track.name){
      //     console.log(publication.track);
      //    // publication.track.enable();
      //   }
      // });
      this.audioMuted = false;
    }
  }

  disableWebCam() {
    if (this.deactivateWebCam == false) {
      this.roomData.localParticipant.videoTracks.forEach(publication => {
        publication.track.disable();
      });
      this.deactivateWebCam = true;
      this.showCoachAvatar = true;
    } else {
      this.roomData.localParticipant.videoTracks.forEach(publication => {
        publication.track.enable();
      });
      this.deactivateWebCam = false;
      this.showCoachAvatar = false;
    }
  }
  getLiveLikeDislike(roomname:string){
    this.initData(this.live, this.liveService.getLive(roomname), () => {
  });
  }
  stopLive() {  
    this.live.live_info.status = 'COMPLETE';
   // console.log(this.live);
    this.initData(null, this.liveService.updateVideo(this.live));
    this.ngOnDestroy();
  }
  // end new live code *********************************************************************

}