import { Component, OnInit, Renderer2, OnDestroy, HostListener } from '@angular/core';

import { CommonComponent } from '../../shared/mock/component';

import { DomSanitizer } from '@angular/platform-browser';
import { User } from '../../shared/models/user';
import { UserService } from '../../shared/services/user.service';
import { TokenService } from '../../shared/authentication/token.service';
import { Video } from '../../shared/models/video';
import { VideoService } from '../../shared/services/video.service';
import { Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'pft-user-live',
  templateUrl: './user-live.component.html',
  styleUrls: ['./user-live.component.css']
})
export class UserLiveComponent extends CommonComponent implements OnInit {

  public live_videos: Video[] = [];
  public live_to_be_deleted: Video;
  public index: number;
  private user: User = new User();

  public source_ids: any[] = [];
  public interval_id : any = undefined;
  public loading: boolean = false;

  public video_info = {title: '', description: ''};

  constructor(
    private sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private userService: UserService,
    private tokenService: TokenService,
    private liveService: VideoService,
    private router: Router
  ) {
  	super();
  }

  ngOnInit() {
    this.user = this.tokenService.user;
    this.liveService.getUserLive().subscribe(
      data => {
        this.live_videos = data;
      },
      error => {
        console.log(error);
      }
    );
  }

  removeLive() {
    this.loading = true;
    this.live_videos.splice(this.index, 1);
    this.liveService.setVideoInactive(this.live_to_be_deleted._id).subscribe(
      data => {
        this.loading = false;
        this.index = undefined;
        this.live_to_be_deleted = undefined;
        this.hideConfirmationModal();
      }, error => {
        console.log(error);
      }
    );
  }

  showConfirmationModal(live: Video, index: number) {
    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    $(".signup_form").removeClass("show");
    $(".form_popup#login_form_popup").addClass("opened");
    $(".login_form").addClass("show");
    this.live_to_be_deleted = live;
    this.index = index;
  }

  hideConfirmationModal(){
    this.renderer.removeClass(document.body, 'overlay');
    $(".form_popup").removeClass("opened");
    $(".signup_form").removeClass("show");
    $(".login_form").removeClass("show");
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if($('.form_popup.opened').length > 0 || $('.login_form.show').length > 0) {
      if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');
      } else { this.renderer.removeClass(document.body, 'overlay'); }
    }
  }

  goLiveNow(live_id: string){
    this.router.navigate(['/live', 'go', live_id]);
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

  navigateTo(live: any) {
		if ( live.user_id == this.user._id ) {
      if(live._id && (live.live_info.status == 'COMPLETE') ) {
        this.router.navigate(['/live/' + live._id]);
      } else {
  			if(live._id) this.router.navigate(['/live/go/' + live._id]);
      }
		} else {
			if(live._id) this.router.navigate(['/live/' + live._id]);
		}
	}

}
