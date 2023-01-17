import { Component, OnInit } from '@angular/core';

import { CommonComponent } from '../../shared/mock/component';

import { UserService } from '../../shared/services/user.service';
import { TokenService } from '../../shared/authentication/token.service';

import { User } from '../../shared/models/user';

@Component({
  selector: 'pft-user-password',
  templateUrl: './user-password.component.html'
})
export class UserPasswordComponent extends CommonComponent implements OnInit {

  public user: User = new User();
  public password_field: string = '';
  public new_password: string = undefined;
  public confirm_password: string = undefined;
  public message_success = false;
  public message_error = false;
  public missing_password = false;

  constructor(
    private tokenService: TokenService,
    private userService: UserService
  ) {
    super();
  }

  ngOnInit() {
    this.user = this.tokenService.decodeUserToken();
  }

  update_password() {
    if (this.new_password == undefined || this.confirm_password == undefined) {
      this.missing_password = true;
    } else if (this.new_password != '' && this.new_password == this.confirm_password) {
      this.userService.checkAndUpdatePassword({old_password: this.password_field, new_password: this.new_password}).subscribe(
        result => {

          this.message_success = true;
          this.new_password = null;
          this.confirm_password = null;
          this.password_field = null;
          this.message_error = false;
          this.missing_password = false;

        }, err => {
          console.log(err);

          this.message_error = true;
          this.new_password = null;
          this.confirm_password = null;
          this.password_field = null;
          this.message_success = false;
          this.missing_password = false;
        }
      );
    }
  }
}
