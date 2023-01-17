import { Component, OnInit } from '@angular/core';

import { CommonComponent } from '../shared/mock/component';

import { UserService } from '../shared/services/user.service';
import { TokenService } from '../shared/authentication/token.service';

import { User } from '../shared/models/user';

@Component({
  selector: 'pft-watch-later',
  templateUrl: './watch-later.component.html'
})
export class WatchLaterComponent extends CommonComponent implements OnInit {

  public user: User = new User();

  constructor(
    private userService: UserService,
    private tokenService: TokenService) {
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

  removeFromWatchLater(index: number) {

    this.user.watch_later_videos.splice(index, 1);
    this.initData(null, this.userService.updateUser(this.user, ["watch_later_videos"]));
  }
}
