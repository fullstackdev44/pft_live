import { Component, OnInit, Renderer2, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';

import { CommonComponent } from '../../shared/mock/component';

import { VideoService } from '../../shared/services/video.service';

import { Video } from '../../shared/models/video';

import { DomSanitizer } from '@angular/platform-browser';
import { User } from '../../shared/models/user';
import { UserService } from '../../shared/services/user.service';
import { TokenService } from '../../shared/authentication/token.service';

declare var $: any;

@Component({
  selector: 'pft-user-default',
  templateUrl: './user-default.component.html'
})
export class UserDefaultComponent extends CommonComponent implements OnInit, OnDestroy {

  public latest_videos: Video[] = [];
  public video_to_be_deleted: Video;
  public index: number;
  private user: User = new User();

  public source_ids: any[] = [];
  public interval_id : any = undefined;
  public loading: boolean = false;

  public video_info = {title: '', description: ''};

  constructor(
    private videoService: VideoService,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private userService: UserService,
    private tokenService: TokenService,
    private router: Router
  ) {
  	super();
  }

  ngOnInit() {

  	this.videoService.getUserLatestVideo().subscribe(
      data => {
        this.latest_videos = data;
        for (let i=0; i<data.length; i++) {
          if(this.latest_videos[i].vimeo && this.latest_videos[i].vimeo.video_url_link){
            let video_url = this.latest_videos[i].vimeo.video_url_link; //.replace(".hd.mp4", ".sd.mp4");
            this.latest_videos[i]['safe_video_url'] = this.sanitizer.bypassSecurityTrustResourceUrl(video_url);
          }
        }
        this.latest_videos.map(current => {
          if(current.upload_status == 'PENDING') {
            this.source_ids.push(current.source_id);
          }
        });
        this.interval_id = setInterval(() => {
          this.checkMyVideoStatus();
        }, 10000)
      },
      error => {
        console.log(error);
      }
    );

    this.initData(this.user, this.userService.getUserDetailPopulate(this.tokenService.user._id));
  }

  removeVideo() {
    this.loading = true;
    this.latest_videos.splice(this.index, 1);
    this.videoService.setVideoInactive(this.video_to_be_deleted._id).subscribe(
      data => {
        this.loading = false;
        this.index = undefined;
        this.video_to_be_deleted = undefined;
        this.hideConfirmationModal();
      }, error => {
        console.log(error);
      }
    );
  }

  showConfirmationModal(video: Video, index: number) {
    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    $(".signup_form").removeClass("show");
    $(".form_popup#login_form_popup").addClass("opened");
    $(".login_form").addClass("show");
    this.video_to_be_deleted = video;
    this.index = index;
  }

  hideConfirmationModal(){
    this.renderer.removeClass(document.body, 'overlay');
    $(".form_popup").removeClass("opened");
    $(".signup_form").removeClass("show");
    $(".login_form").removeClass("show");
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

  checkMyVideoStatus() {
    if (this.source_ids && this.source_ids.length > 0) {
      this.videoService.checkMyUploadedVideoStatus(this.source_ids).subscribe(
        data => {
          if (data) {
            data.map(current => {
              if (current.upload_status == 'COMPLETE') {
                this.source_ids.map((current_source, current_index) => {
                  if (current_source == current.source_id) this.source_ids.splice(current_index, 1);
                });
                this.latest_videos.map((current_video, index) => {
                  if (current_video.source_id == current.source_id) {
                    this.latest_videos[index].upload_status = current.upload_status;
                    this.latest_videos[index].thumbnail = current.thumbnail;
                    this.latest_videos[index].duration = current.duration;
                  }
                });
              }
            });
          }
        }, error => {
          console.log(error);
        }
      );
    } else {
      if (this.interval_id) {
        clearInterval(this.interval_id);
      }
    }
  }

  ngOnDestroy() {
    if (this.interval_id) {
      clearInterval(this.interval_id);
    }
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
}
