import { Component, OnInit } from '@angular/core';

import { CommonComponent } from '../../shared/mock/component';

import { UserService } from '../../shared/services/user.service';
import { TokenService } from '../../shared/authentication/token.service';

import { User } from '../../shared/models/user';

@Component({
  selector: 'pft-user-notification',
  templateUrl: './user-notification.component.html',
  styleUrls: ['./user-notification.component.css']
})
export class UserNotificationComponent extends CommonComponent implements OnInit {

	public user: User = new User();

  constructor(private userService: UserService,
  	private tokenService: TokenService) {
  	super();
  }

  ngOnInit() {

  	this.tokenService.decodeUserToken();
  	//replace queryUser by a native query (that use decoded not a specific id)
    // this.initData(this.user, this.userService.queryUser(this.tokenService.user._id, ['notifications'], ['notifications']));
    this.initData(this.user, this.userService.getUserDetailPopulate(this.tokenService.user._id), () => {
      this.user.notifications = this.user.notifications.filter(current => {
        return current.name != 'Mentions';
      });
    });
  }

  update_notification(index: number) {
    this.user.notifications[index].status = !this.user.notifications[index].status;
    this.update_user(["notifications"]);
  }

  update_user(fields: Array<string> = []) {
  	this.initData(null, this.userService.updateUser(this.user, fields));
  }

}
