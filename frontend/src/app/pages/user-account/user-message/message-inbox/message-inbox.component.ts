import { Component, OnInit, Renderer2, HostListener } from '@angular/core';

import { CommonComponent } from '../../../shared/mock/component';

import { MessageService } from '../../../shared/services/message.service';

import { Message } from '../../../shared/models/message';
import { ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
  selector: 'pft-message-inbox',
  templateUrl: './message-inbox.component.html'
})
export class MessageInboxComponent extends CommonComponent implements OnInit {

  public inbox_messages: Message[] = [];
  public index: number;
  public message_id: string;
  public load_message_from_routing = false;
  public show_message_detail: boolean = undefined;
  public total_message_unread_count : number = undefined;
  public loading: boolean = false;

  constructor(
    private messageService: MessageService,
    private renderer: Renderer2,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    // this.checkInbox();
    this.route.params.subscribe(
      params => {
        if (params.message_id) {
          this.checkInbox(true, params.message_id);
        } else {
          this.checkInbox(undefined, undefined);
        }
      }
    );
  }

  deleteMessage() {
    this.loading = true;
    this.initData(null, this.messageService.changeMessageStatus(this.message_id, 'DELETED'), () => {
      this.inbox_messages.splice(this.index, 1);
      this.loading = false;
      this.index = undefined;
      this.message_id = undefined;
      this.checkInbox(undefined, undefined);
      this.hideConfirmationModal();
    });
  }

  readMessage() {
    this.initData(null, this.messageService.changeMessageStatus(this.message_id, 'READ'), (data) => {
      this.inbox_messages[this.index].status = 'READ';
      this.message_id = undefined;
      this.checkInbox(undefined, undefined);
    });
  }

  showConfirmationModal(index: number, message_id: string) {
    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    $(".signup_form").removeClass("show");
    $(".form_popup").addClass("opened");
    $(".login_form").addClass("show");
    this.index = index;
    this.message_id = message_id;
  }

  hideConfirmationModal(){
    this.renderer.removeClass(document.body, 'overlay');
    $(".form_popup").removeClass("opened");
    $(".signup_form").removeClass("show");
    $(".login_form").removeClass("show");
  }

  checkInbox(load_modal: boolean, message_id: string) {
    this.initData(this.inbox_messages, this.messageService.getInbox(), () => {
      let total_message_unread = 0;
      this.inbox_messages.map(current => {
        current.status != 'READ' ? total_message_unread += 1 : '';
      });
      this.messageService.setTotal_message_unread(total_message_unread);
      this.total_message_unread_count = total_message_unread;
      if (load_modal == true) {
        this.load_message_from_routing = true;
        this.inbox_messages.map((current, index) => {
          if (current._id == message_id) {
            this.showConfirmationModal(index, message_id);
            this.readMessage();
            return;
          }
        });
      }

    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if($('.form_popup.opened').length > 0 || $('.login_form.show').length > 0) {
      if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');
      } else { this.renderer.removeClass(document.body, 'overlay'); }
    }
  }

}
