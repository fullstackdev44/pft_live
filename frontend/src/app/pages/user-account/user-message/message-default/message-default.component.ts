import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CommonComponent } from '../../../shared/mock/component';

import { MessageService } from '../../../shared/services/message.service';
import { TokenService } from '../../../shared/authentication/token.service';

import { Message } from '../../../shared/models/message';
import { User } from '../../../shared/models/user';
import { UserService } from '../../../shared/services/user.service';
import { ChatService } from '../../../shared/services/chat.service';

@Component({
  selector: 'pft-message-default',
  templateUrl: './message-default.component.html'
})
export class MessageDefaultComponent extends CommonComponent implements OnInit {

	public new_message = new Message();
  public user: User = new User();
  public receiver: any[] = [];
  public contacts: any[] = [];
  public new_receivers: any[] = [];
  public message_info: boolean = undefined;

  constructor(
    private messageService: MessageService,
    private tokenService: TokenService,
    private userService: UserService,
    private chatService: ChatService,
    private route: ActivatedRoute
  ) {
  	super();
  }

  ngOnInit() {

    // receiver from queryParam
    const channel_param_id = this.route.snapshot.queryParams['channel'];
    if(channel_param_id && channel_param_id != ''){
      let channel_owner: User = new User();
      this.initData(channel_owner, this.userService.getByChannel(channel_param_id), () => {

        if(channel_owner){
          this.new_receivers = [{id: channel_owner._id, text: channel_owner.channel}];
          this.receiver = [{_id: channel_owner._id}];
        }
      })
    }

    this.userService.getUserDetailPopulate(this.tokenService.user._id).subscribe(
      data => {
        this.user = data;
        this.contacts = this.user.contacts.map(current => {
          return {
            id: current._id,
            text: current.full_name ? current.full_name : ''
          };
        });
      }, error => {
        console.log(error);
      }
    );
  }

  send() {

    this.new_message.receiver = this.receiver;
    this.new_message.status = 'SENT';
    this.new_message.sender = {_id: this.user._id, avatar_card: this.user.avatar_card, avatar_color: this.user.avatar_color}; // I need avatar card and color for notification

    if (this.new_message.receiver.indexOf(this.user) == -1) {
      this.messageService.createMessage(this.new_message).subscribe(
        data => {
          this.new_receivers = [];
          this.new_message = new Message();
          this.message_info = true;
          this.receiver = [];
        }, error => {
          console.log(error);
          this.message_info = false;
        });
    } else {
      console.log("error, you can not send message to yourself!");
    }
  }

  selected(event: any) {
    const contact_index = this.user.contacts.map(current => current._id).indexOf(event.id);
    this.receiver.push(this.user.contacts[contact_index]);
  }

  removed(event: any) {
    const contact_index = this.receiver.map(current => current._id).indexOf(event.id);
    this.receiver.splice(contact_index, 1);
  }

}
