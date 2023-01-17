import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { Router } from '@angular/router';

import { CommonComponent } from '../shared/mock/component';

import { UserService } from '../shared/services/user.service';
import { VideoService } from '../shared/services/video.service';
import { TokenService } from '../shared/authentication/token.service';

import { User } from '../shared/models/user';
import { Video } from '../shared/models/video';

declare var $: any;
@Component({
  selector: 'pft-updates-from-subs',
  templateUrl: './updates-from-subs.component.html'
})
export class UpdatesFromSubsComponent extends CommonComponent implements OnInit {

  public updates_from_subs: any[] = [];
  private page: number = 0;
  private page_size: number = 4;
  public show_more_updates: boolean = false;

  private user: User = new User();

  public video_info = {title: '', description: ''};

  public skip_from :number = 0;
  public skip_to :number = 4;
  public all_updates_from_subs: any[] = [];

  constructor(
    private router: Router,
    private userService: UserService,
    private videoService: VideoService,
    private tokenService: TokenService,
    private renderer: Renderer2
  ) {
    super();
  }

  ngOnInit() {

    if(this.tokenService.user && this.tokenService.user._id){
      this.initData(this.user, this.userService.getUserDetailPopulate(this.tokenService.user._id), () => {

        if(this.user){
          this.getAllUpdatesFromSubscriptions();
        }
        else{
          this.router.navigate(['/login']);
        }
      });
    }
    else{
      this.router.navigate(['/login']);
    }
  }

  getAllUpdatesFromSubscriptions() {

    this.userService.getUpdatesFromSubscriptionsDetail(this.page, this.page_size).subscribe(
      data => {
        this.all_updates_from_subs = data;
        this.getMoreUpdatesFromSubscriptions();
      }, error => {
        console.log(error);
      });
  }

  getMoreUpdatesFromSubscriptions() {
    this.updates_from_subs = this.updates_from_subs.concat(this.all_updates_from_subs.slice(this.skip_from, this.skip_to));
    this.skip_from += 4;
    this.skip_to += 4;

    if (this.updates_from_subs.length > 0) {
      this.updates_from_subs.map(current => {
        if (current && current.channel && current.channel.active == true) {
          this.show_more_updates = true;
        }
      })
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

  // when the user click X button, the section is hidden, and the Event model 'hidden' field is set to true
  // but new videos will show up if the channel publish other videos in the future
  removeFromUpdatesFromSubscriptions(channel_id: string, index: number) {
    this.userService.removeFromUpdatesFromSubscriptions(channel_id).subscribe(
      data => {
        this.updates_from_subs.splice(index, 1);
      }, error => {
        console.log(error)
      }
    );
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if($('.form_popup.opened').length > 0 || $('.login_form.show').length > 0) {
      if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');
      } else { this.renderer.removeClass(document.body, 'overlay'); }
    }
  }

}
