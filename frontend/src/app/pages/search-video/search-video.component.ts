import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CommonComponent } from '../shared/mock/component';

import { VideoService } from '../shared/services/video.service';
import { UserService } from '../shared/services/user.service';
import { TokenService } from '../shared/authentication/token.service';

import { Video } from '../shared/models/video';
import { User } from '../shared/models/user';

declare var $: any;
@Component({
  selector: 'pft-search-video',
  templateUrl: './search-video.component.html',
  styleUrls: ['./search-video.component.css']
})
export class SearchVideoComponent extends CommonComponent implements OnInit {

  public filter: any = {
    upload_date: '',
    type: 'video',
    duration: '',
    features: '',
    sort_by: 'relevance',
    term: ''
  };

  public search_results: any[] = [];
  public user: User = new User();
  public result_type = 'video';

  public video_view = false;

  public video_info = {title: '', description: ''};

  constructor(
    private videoService: VideoService,
    private route: ActivatedRoute,
    private userService: UserService,
    private tokenService: TokenService,
    private renderer: Renderer2
    ) {
    super();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params.term) {
        this.filter.term = params.term;
        // I replace initData call by this as initData didn't change
        // search_results while data from backend is void
        this.videoService.getVideoByFilter(this.filter).subscribe(
          data => {
            this.search_results = data;
          }, error => {
            console.log(error);
          }
        );
      } else {
        this.initData(this.search_results, this.videoService.getAllVideos());
      }

      if (this.tokenService.user) {
        this.initData(this.user, this.userService.getUserDetailPopulate(this.tokenService.user._id), () => {
          if (params.term) {
            this.user.search_terms_history.map(current => current.term.toLowerCase()).indexOf(params.term.toLowerCase()) > -1 ?
              this.user.search_terms_history.splice(this.user.search_terms_history.map(current => current.term.toLowerCase()).indexOf(params.term.toLowerCase()), 1) : '';
            this.user.search_terms_history.unshift({term: params.term, date: new Date()});

            this.userService.updateUser(this.user, ["search_terms_history"]).subscribe(
              data => {

              }, error => {
                console.log(error);
              }
            );
          }
        });
      }

    });
  }

  search(param: string = '') {
    if (this.filter.type != 'video' && this.filter.type != 'movie') {
      delete this.filter.upload_date;
      delete this.filter.features;
      delete this.filter.duration;
    }

    if ((this.filter.type != 'video' && this.filter.type != 'movie')
      && (param == 'upload_date' || param == 'features' || param == 'duration')) {
        // don't sent the request
    } else {
    this.videoService.getVideoByFilter(this.filter).subscribe(
      data => {
        this.search_results = data;
        this.result_type = this.filter.type;
        // NOT USED FOR NOW, AS SORT USE DIRECTLY CHANNEL CREATED FIELD INSTEAD OF YOUTUBE ALGORITHME WHO USE UPLOAD_DATE
        /*if (this.result_type == 'channel') {
          this.video_view = (this.filter.sort_by == 'upload_date');
        }*/
      }, error => {
        console.log(error);
      });
    }
  }

  remove(removed_filter: string) {
    delete this.filter[removed_filter];
    if (!this.filter.hasOwnProperty('type')) {
      this.filter.type = 'video';
    }
    this.search(undefined);
  }

  isUserSubscribed(channel_id: string) {

    const result = this.user.subscribed_channels.find(current => current.toString() === channel_id);
    return !!result;
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
