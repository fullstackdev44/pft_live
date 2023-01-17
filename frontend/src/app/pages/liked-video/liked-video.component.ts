import { Component, OnInit } from '@angular/core';

import { CommonComponent } from '../shared/mock/component';

import { UserService } from '../shared/services/user.service';
import { TokenService } from '../shared/authentication/token.service';

import { User } from '../shared/models/user';
import { Video } from '../shared/models/video';

@Component({
  selector: 'pft-liked-video',
  templateUrl: './liked-video.component.html'
})
export class LikedVideoComponent extends CommonComponent implements OnInit {

  public user: User = new User();

  constructor(private userService: UserService, private tokenService: TokenService) {
    super();
  }

  ngOnInit() {

    const connected_user = this.tokenService.decodeUserToken();
    if(connected_user._id){
      this.initData(this.user, this.userService.getUserDetailPopulate(connected_user._id));
    }
  }

  isUserSubscribed(channel_id: string) {

    const result = this.user.subscribed_channels.find(current => current.toString() === channel_id);
    return !!result;
  }

  removeFromLikedVideo(index: number) {

    this.user.liked_videos.splice(index, 1);
    this.initData(null, this.userService.updateUser(this.user, ["liked_videos"]));
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
