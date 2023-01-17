import { Injectable } from '@angular/core';

import { ApiService } from '../mock/service';

import { Message } from '../models/message';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessageService extends ApiService {

  private messageUrl = environment.config.API_BASE_URL + '/message';
  private total_message_unread: number = undefined;

  getTotal_message_unread () {
    return this.total_message_unread;
  }

  setTotal_message_unread(value: any) {
    return this.total_message_unread = value;
  }

  getAllMessages(): Observable < Message[] > {
    return this.query('get', this.messageUrl);
  }

  createMessage(message: Message): Observable < Message > {
    const receiver_ids = [];
    message.receiver.map(current => {
      receiver_ids.push(current._id);
    });
    message.receiver = receiver_ids;
    return this.query('post', this.messageUrl, message);
  }

  getMessageDetail(id: string): Observable < Message > {
    return this.query('get', this.messageUrl + '/id/' + id);
  }

  updateMessage(message: Message): Observable < Message > {
    return this.query('put', this.messageUrl, message);
  }

  deleteMessage(message_id: string): Observable < Message > {
    return this.query('delete', this.messageUrl + '/' + message_id);
  }

  getInbox(): Observable < Message[] > {
    return this.query('get', this.messageUrl + '/inbox');
  }

  getMessageSent(): Observable < Message[] > {
    return this.query('get', this.messageUrl + '/sent');
  }

  getDeletedMessage(): Observable < Message[] > {
    return this.query('get', this.messageUrl + '/deleted');
  }

  changeMessageStatus(message_id, status): Observable < Message[] > {
    return this.query('get', this.messageUrl + '/changeStatus/' + message_id + '/' + status);
  }

  changeMessageStatusForAll(messages, status): Observable < Message[] > {
    const message_ids = [];
    messages.map(current => {
      message_ids.push(current._id);
    });
    return this.query('post', this.messageUrl + '/changeStatusForAll/', {message_ids: message_ids, status: status});
  }

  contactPftvTeam(message_content: string): Observable < any > {
    return this.query('post', this.messageUrl + '/contactPftvTeam', {message_content: message_content});
  }
}
