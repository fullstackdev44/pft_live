import { Component, OnInit, Renderer2, HostListener } from '@angular/core';

import { CommonComponent } from '../../shared/mock/component';

import { UserService } from '../../shared/services/user.service';
import { TokenService } from '../../shared/authentication/token.service';
import { User } from '../../shared/models/user';
import { Video } from '../../shared/models/video';

declare var $: any;

@Component({
  selector: 'pft-user-watch-later',
  templateUrl: './user-watch-later.component.html'
})
export class UserWatchLaterComponent extends CommonComponent implements OnInit {

  public user: User = new User();
  public index: number;
  public user_subscriptions: any[] = [];
  public loading: boolean = false;

  public video_info = {title: '', description: ''};

  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private renderer: Renderer2
  ) {
    super();
  }

  ngOnInit() {
    const logged_in_user = this.tokenService.decodeUserToken();

    this.initData(this.user, this.userService.getUserDetailPopulate(logged_in_user._id));

    this.user_subscriptions = this.tokenService.getUserSubscriptions();

    if(!this.user_subscriptions){
      this.user_subscriptions = [];
      this.initData(this.user_subscriptions, this.userService.getSubscriptions(), () => {
        this.tokenService.saveUserSubscriptions(this.user_subscriptions);
      })
    }
  }

  removeVideoFromWatchLater() {
    this.loading = true;
    this.user.watch_later_videos.splice(this.index, 1);
    this.userService.updateUser(this.user, ["watch_later_videos"]).subscribe(
      data => {
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

  userIsSubscribedTo(channel_id: string){
    return this.user_subscriptions.map(current => current._id).indexOf(channel_id) > -1;
  }

  isInPurchasedVideo(video_id: string) {
    return this.user.purchased_videos.map(current => current._id).indexOf(video_id) > -1;
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
