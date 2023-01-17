import { Component, OnInit } from '@angular/core';
import { TokenService } from '../../shared/authentication/token.service';
import { CommentService } from '../../shared/services/comment.service';
import { MessageService } from '../../shared/services/message.service';

@Component({
  selector: 'pft-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.css']
})
export class ContractsComponent implements OnInit {

  public user_full_name: string = '';
  public message_content: string = '';
  public status: string = undefined;

  constructor(
    private tokenService: TokenService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    const connected_user = this.tokenService.decodeUserToken();
    if (connected_user) { this.user_full_name = connected_user.full_name; }
  }

  sendMessage() {
    this.messageService.contactPftvTeam(this.message_content).subscribe(
      data => {
        this.message_content = '';
        this.status = 'Your message has been send successfully!';
      }, error => {
        console.log(error);
        this.status = 'There was an error when sending your message!';
      }
    );
  }

}
