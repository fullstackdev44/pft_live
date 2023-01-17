import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CommonComponent } from '../../shared/mock/component';

import { VideoService } from '../../shared/services/video.service';
import { CategoryService } from '../../shared/services/category.service';
import { ChannelService } from '../../shared/services/channel.service';
import { UserService } from '../../shared/services/user.service';
import { TokenService } from '../../shared/authentication/token.service';

import { Video } from '../../shared/models/video';
import { Category } from '../../shared/models/category';
import { User } from '../../shared/models/user';

import { environment } from '../../../../environments/environment';

declare var $: any;

@Component({
  selector: 'pft-category-detail',
  templateUrl: './category-detail.component.html'
})
export class CategoryDetailComponent extends CommonComponent implements OnInit {

  public videos: Video[] = [];
  public show_more_videos: boolean = true;
  public video_page: number = 0;
  public video_page_size: number = 8;

  public category: Category = new Category();

  private user: User = new User();
  public user_subscriptions: any[] = [];

  public AWS_S3_PATH = environment.config.AWS_S3_PATH + '/categories';

  public video_info = {title: '', description: ''};

  constructor(
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private userService: UserService,
    private videoService: VideoService,
    private tokenService: TokenService,
    private renderer: Renderer2
  ) {

    super();
  }

  ngOnInit() {

    this.route.params.subscribe(params => {

      if(params.id){

        this.initData(this.category, this.categoryService.getCategory(params.id), () => {
          // I think it's better to recount it to avoid previous errors (wrong number result) signaled by Eldad
          this.categoryService.countVideoForCategory(this.category._id).subscribe(
            data => {
              this.category.meta.videos = data;
            }, error => {
              console.log(error);
            }
          );
        });
        this.showMoreVideos(params.id);
      }
    })

    if (this.tokenService.user && this.tokenService.user._id) {
      this.initData(this.user_subscriptions, this.userService.getSubscriptions());
      this.initData(this.user, this.userService.getConnected());
    }
  }

  showMoreVideos(category_id = null){
    this.videoService.getVideosForCategory(category_id ? category_id : this.category._id, this.video_page, this.video_page_size).subscribe(
      data => {

        if(data.length < this.video_page_size){
          this.show_more_videos = false;
        }

        this.videos = this.videos.concat(data);

        this.video_page += 1;
      })
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
