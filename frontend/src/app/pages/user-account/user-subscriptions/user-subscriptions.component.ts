import { Component, OnInit } from '@angular/core';

import { CommonComponent } from '../../shared/mock/component';

import { UserService } from '../../shared/services/user.service';
import { TokenService } from '../../shared/authentication/token.service';

import { Channel } from '../../shared/models/channel';
import { User } from '../../shared/models/user';

@Component({
  selector: 'pft-user-subscriptions',
  templateUrl: './user-subscriptions.component.html'
})
export class UserSubscriptionsComponent extends CommonComponent implements OnInit {

	public user: User = new User();

  constructor(private userService: UserService,
  	private tokenService: TokenService) {
  	super();
  }

  ngOnInit() {

  	this.tokenService.decodeUserToken();
  	// replace this with a query that don't need id parameter
  	this.initData(this.user, this.userService.queryUser(this.tokenService.user._id, ['subscribed_channels'], ['subscribed_channels.channel']));
  }

  update_status(index: number, status: string) {

    this.user.subscribed_channels[index].status = status == 'Active' ? 'Inactive' : (status == 'Inactive' ? 'Paused' : (status == 'Paused' ? 'Active' : this.user.subscribed_channels[index].status));
    this.update_user(["subscribed_channels"]);
  }

  update_user(fields: Array<string> = []) {
    this.initData(null, this.userService.updateUser(this.user, fields));
  }

}
