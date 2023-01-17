import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { VideoService } from '../shared/services/video.service';
import { UserService } from '../shared/services/user.service';
import { TokenService } from '../shared/authentication/token.service';
import { ChannelService } from '../shared/services/channel.service';
import { MessageService } from '../shared/services/message.service';

import { Video } from '../shared/models/video';
import { User } from '../shared/models/user';
import { Channel } from '../shared/models/channel';
import { Message } from '../shared/models/message';

import { DomSanitizer } from '@angular/platform-browser';
import { CommonComponent } from '../shared/mock/component';

@Component({
  selector: 'pft-user-account',
  templateUrl: './user-account.component.html',
  styleUrls: ['./user-account.component.css']
})
export class UserAccountComponent extends CommonComponent implements OnInit {

  public inbox_messages: Message[] = [];
  public user: User = new User();
  private default_user_value = new User();

  public total_message_unread_count : number = undefined;

  // for mobile view only
  public show_hide_user_account_menu: boolean = false;

  public user_channel: Channel = new Channel();

  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {

    const user = this.tokenService.decodeUserToken();

    if(user && user._id){
      this.userService.getUserDetail(user._id).subscribe(
        data => {
          this.user = data;
          this.getUserChannel();
        }, error => {
          console.log(error);
        }
      );

      this.checkInbox();
    }
    else{
      localStorage.setItem('url',this.route.snapshot['_routerState']['url']);
      console.log(localStorage.getItem('url'));
      localStorage.setItem('action', '');
      localStorage.setItem('reloaded', 'no');
      this.router.navigate(['/', 'login']);
    }
  }

  checkInbox() {
    this.initData(this.inbox_messages, this.messageService.getInbox(), () => {
      let total_message_unread = 0;
      this.inbox_messages.map(current => {
        current.status != 'READ' ? total_message_unread += 1 : '';
      });
      this.messageService.setTotal_message_unread(total_message_unread);
      this.total_message_unread_count = total_message_unread;
    });
  }

  getUserChannel() {
    this.userService.getChannelByOwner().subscribe(
      data => {
        this.user_channel.active = true;
        if(data.length > 0) this.user_channel = data[0];
      }, error => {
        console.log(error);
      }
    );
  }

}
