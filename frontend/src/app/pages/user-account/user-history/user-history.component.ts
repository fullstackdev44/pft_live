import { Component, OnInit, Renderer2, HostListener } from '@angular/core';

import { CommonComponent } from '../../shared/mock/component';

import { UserService } from '../../shared/services/user.service';
import { TokenService } from '../../shared/authentication/token.service';
import { User } from '../../shared/models/user';
import { Video } from '../../shared/models/video';
import { CommentService } from '../../shared/services/comment.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Comment } from '../../shared/models/comment';

declare var $: any;

@Component({
  selector: 'pft-user-history',
  templateUrl: './user-history.component.html'
})
export class UserHistoryComponent extends CommonComponent implements OnInit {

  public user: User = new User();
  public index: number;
  public user_subscriptions: any[] = [];
  public video_comments_history: Comment[] = [];
  // Comment this for now as live functionality is not yet available
  public live_comments_history: Comment[] = [];
  public to_be_deleted: string;
  public delete_video_id: string;
  public history_term: string;
  public searching = false;
  public search_result: any[] = [];
  public report_view = false;
  public show_arrow: any[] = [];
  public skip_option: number[] = [0, 0];
  private initial_value: boolean[] = [false, false, false, false, false];
  public user_search_term_history: any[] = [];
  public user_watch_history: any[] = [];
  public user_report_history: any[] = [];
  public index_start: number[] = [0, 0, 0, 0, 0];
  public index_end: number[] = [5, 15, 0, 5, 0];
  public index_interval: number[] = [5, 15, 0, 5, 0];

  public active_tabs: string = undefined;

  public loading: boolean = false;

  public video_info = {title: '', description: ''};

  public user_deleted_a_video: boolean = false;

  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private renderer: Renderer2,
    private commentService: CommentService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    this.route.params.subscribe(
      params => {
        if (params.report == 'report') {
          this.report_view = true;
        }
      }
    );
    const logged_in_user = this.tokenService.decodeUserToken();

    this.initData(this.user, this.userService.getUserDetailPopulate(logged_in_user._id),() => {
      this.show_more_search_history();
      this.show_more_watch_history();
      this.show_more_report_history();
    });

    this.user_subscriptions = this.tokenService.getUserSubscriptions();

    if(!this.user_subscriptions){
      this.user_subscriptions = [];
      this.initData(this.user_subscriptions, this.userService.getSubscriptions(), () => {
        this.tokenService.saveUserSubscriptions(this.user_subscriptions);
      })
    }

    this.show_more_comments();
    this.show_more_live_comments();
  }

  search(value: string) {
    this.router.navigate(['/search-video/' + value]);
  }

  removeVideoFromHistory() {
    switch (this.to_be_deleted) {
      case 'video':
        if (!this.delete_video_id) {
          this.user.videos_history.splice(this.index, 1);
          this.user_watch_history.splice(this.index, 1);
        } else {
          this.search_result.splice(this.index, 1);
          this.user.videos_history = this.user.videos_history.filter(current => current._id != this.delete_video_id);
          this.user_watch_history = this.user_watch_history.filter(current => current._id != this.delete_video_id);
        }
        this.user_deleted_a_video =  true;
        this.updateUserVideoHistory();
        break;
      case 'search_term':
        this.user.search_terms_history.splice(this.index, 1);
        this.user_search_term_history.splice(this.index, 1);
        this.update_user(["search_terms_history"]);
        break;
      case 'comment':
        this.delete_comment();
        break;
      case 'live':
        this.delete_live_comment();
        break;
      default:
        break;
    }
  }

  update_user(fields: Array<string> = []) {
    this.userService.updateUser(this.user, fields).subscribe(
      data => {
        this.loading = false;
        this.index = undefined;
        this.to_be_deleted = undefined;
        this.delete_video_id = undefined;
        this.hideConfirmationModal();
      }, error => {
        console.log(error);
      }
    );
  }

  updateUserVideoHistory() {
    this.userService.updateUserVideoHistory(this.user).subscribe(
      data => {
        this.loading = false;
        this.index = undefined;
        this.to_be_deleted = undefined;
        this.delete_video_id = undefined;
        this.hideConfirmationModal();
      }, error => {
        console.log(error);
      }
    );
  }

  delete_comment() {
    this.loading = true;
    this.commentService.deleteComment(this.video_comments_history[this.index]).subscribe(
      data => {
        this.loading = false;
        this.video_comments_history.splice(this.index, 1);
        this.index = undefined;
        this.to_be_deleted = undefined;
        this.hideConfirmationModal();
      }, error => {
        console.log(error);
      }
    );
  }

  delete_live_comment() {
    this.loading = true;
    this.commentService.deleteComment(this.live_comments_history[this.index]).subscribe(
      data => {
        this.loading = false;
        this.live_comments_history.splice(this.index, 1);
        this.index = undefined;
        this.to_be_deleted = undefined;
        this.hideConfirmationModal();
      }, error => {
        console.log(error);
      }
    );
  }

  showConfirmationModal(index: number, to_be_deleted: string, delete_video_id: string) {
    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    $(".signup_form").removeClass("show");
    $(".form_popup#login_form_popup").addClass("opened");
    $(".login_form").addClass("show");
    this.index = index;
    this.to_be_deleted = to_be_deleted;
    this.delete_video_id = delete_video_id;
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

  searchInHistory(value: string) {
    this.searching = true;
    this.search_result = [];
    this.user.videos_history.filter((current) => {
      if (current.title.toLowerCase().includes(value.toLowerCase())) {
        this.search_result.push(current);
      }
    });
  }

  show_more_comments() {
    this.commentService.getVideoCommentsHistoryWithSkipOption(this.skip_option[0]).subscribe(
      data => {
        data.length > 0 ? this.show_arrow[2] = true : this.show_arrow[2] = false ;
        if (this.initial_value[2] == false) {
          data.length >= 10 ? this.show_arrow[2] = true : this.show_arrow[2] = false ;
          this.initial_value[2] = true;
        }
        this.video_comments_history = this.video_comments_history.concat(data);
        this.skip_option[0] += 10;
      }, error => {
        console.log(error);
    });
  }

  show_more_live_comments() {
    this.commentService.getVideoCommentsHistoryWithSkipOption(this.skip_option[1]).subscribe(
      data => {
        data.length > 0 ? this.show_arrow[4] = true : this.show_arrow[4] = false ;
        if (this.initial_value[4] == false) {
          data.length >= 10 ? this.show_arrow[4] = true : this.show_arrow[4] = false ;
          this.initial_value[4] = true;
        }
        this.live_comments_history = this.live_comments_history.concat(data);
        this.skip_option[1] += 10;
      }, error => {
        console.log(error);
    });
  }

  show_more_search_history() {
    let next_value = this.user.search_terms_history.slice(this.index_start[1], this.index_end[1]);
    next_value.map(current => {
      this.user_search_term_history.push(current);
    });
    next_value.length > 0 ? this.show_arrow[1] = true : this.show_arrow[1] = false ;
    if (this.initial_value[1] == false) {
      this.user_search_term_history.length >= 15 ? this.show_arrow[1] = true : this.show_arrow[1] = false ;
      this.initial_value[1] = true;
    }
    this.index_start[1] = this.index_end[1];
    this.index_end[1] = this.index_end[1] + this.index_interval[1];
  }

  show_more_watch_history() {
    this.index_start[0] = this.user_deleted_a_video == true ? this.user_watch_history.length : this.index_start[0];
    this.index_end[0] = this.user_deleted_a_video == true ? this.user_watch_history.length + this.index_interval[0] : this.index_end[0];
    let next_value = this.user.videos_history.slice(this.index_start[0], this.index_end[0]);
    next_value.map(current => {
      this.user_watch_history.push(current);
    });
    next_value.length > 0 ? this.show_arrow[0] = true : this.show_arrow[0] = false ;
    if (this.initial_value[0] == false) {
      this.user_watch_history.length >= 5 ? this.show_arrow[0] = true : this.show_arrow[0] = false ;
      this.initial_value[0] = true;
    }
    this.index_start[0] = this.index_end[0];
    this.index_end[0] = this.index_end[0] + this.index_interval[0];
    this.user_deleted_a_video = false;
  }

  show_more_report_history() {
    let next_value = this.user.report_history.slice(this.index_start[3], this.index_end[3]);
    next_value.map(current => {
      this.user_report_history.push(current);
    });
    next_value.length > 0 ? this.show_arrow[3] = true : this.show_arrow[3] = false ;
    if (this.initial_value[3] == false) {
      this.user_report_history.length >= 5 ? this.show_arrow[3] = true : this.show_arrow[3] = false ;
      this.initial_value[3] = true;
    }
    this.index_start[3] = this.index_end[3];
    this.index_end[3] = this.index_end[3] + this.index_interval[3];
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if($('.form_popup.opened').length > 0 || $('.login_form.show').length > 0) {
      if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');
      } else { this.renderer.removeClass(document.body, 'overlay'); }
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
