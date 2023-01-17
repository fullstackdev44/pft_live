import { Component, OnInit, Renderer2, HostListener } from '@angular/core';

import { CommonComponent } from '../../../shared/mock/component';

import { MessageService } from '../../../shared/services/message.service';

import { Message } from '../../../shared/models/message';

declare var $: any;

@Component({
  selector: 'pft-message-sent',
  templateUrl: './message-sent.component.html'
})
export class MessageSentComponent extends CommonComponent implements OnInit {

  public sent_messages: Message[] = [];
  public index: number;
  public message_id: string;
  public show_message_detail: boolean = undefined;
  public loading: boolean = false;

  constructor(
    private messageService: MessageService,
    private renderer: Renderer2
  ) {
    super();
  }

  ngOnInit() {
    this.initData(this.sent_messages, this.messageService.getMessageSent());
  }

  changeMessageStatus(index: number, message_id: string, status: string) {
    this.sent_messages.splice(index, 1);
    this.initData(null, this.messageService.changeMessageStatus(message_id, status));
  }

  deleteMessage() {
    this.loading = true;
    this.initData(null, this.messageService.changeMessageStatus(this.message_id, 'DELETED'), () => {
      this.sent_messages.splice(this.index, 1);
      this.loading = false;
      this.index = undefined;
      this.message_id = undefined;
      this.hideConfirmationModal();
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

  hideConfirmationModal() {
    this.renderer.removeClass(document.body, 'overlay');
    $(".form_popup").removeClass("opened");
    $(".signup_form").removeClass("show");
    $(".login_form").removeClass("show");
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if($('.form_popup.opened').length > 0 || $('.login_form.show').length > 0) {
      if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');
      } else { this.renderer.removeClass(document.body, 'overlay'); }
    }
  }

}
