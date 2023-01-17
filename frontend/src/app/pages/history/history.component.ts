import { Component, OnInit } from '@angular/core';

import { CommonComponent } from '../shared/mock/component';

import { UserService } from '../shared/services/user.service';
import { CommentService } from '../shared/services/comment.service';
import { VideoService } from '../shared/services/video.service';
import { TokenService } from '../shared/authentication/token.service';

import { User } from '../shared/models/user';
import { Comment } from '../shared/models/comment';
import { Video } from '../shared/models/video';

@Component({
  selector: 'pft-history',
  templateUrl: './history.component.html'
})
export class HistoryComponent extends CommonComponent implements OnInit {

  public videos_history: Video[] = [];
  public video_comments_history: Comment[] = [];
  public live_comments_history: Comment[] = [];
  public search_terms_history: any[] = [];
  private user: User = new User();

  constructor(
    private userService: UserService,
    private commentService: CommentService,
    private videoService: VideoService,
    private tokenService: TokenService) {
    super();
  }

  ngOnInit() {

    this.initData(this.video_comments_history, this.commentService.getVideoCommentsHistory());

    this.initData(this.user, this.userService.getUserDetailPopulate(this.tokenService.user._id));

    this.initData(this.videos_history, this.videoService.getUserHistory());
    this.initData(this.search_terms_history, this.userService.getUserSearchHistory());
  }

  isUserSubscribed(channel_id: string) {
    
    const result = this.user.subscribed_channels.find(current => current.toString() === channel_id);
    return !!result;
  }

  isInWatchLater(video_id: string) {
    return this.user.watch_later_videos.map(current => current._id).indexOf(video_id) > -1;
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
}
