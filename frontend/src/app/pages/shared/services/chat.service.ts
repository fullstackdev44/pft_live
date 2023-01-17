import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private socket: Socket) { }

  public sendMessage(message: Message) {
    this.socket.emit('send_message_to_server', message);
  }

  public sendNotification(notification: any) {
    this.socket.emit('send_notification_to_server', notification);
  }

  public getMessage() {
    return this.socket.fromEvent("send_message_to_client").map( data => data['message']);
  }

  public getNotifcation() {
    return this.socket.fromEvent("send_notification_to_client").map( data => data['notification']);
  }

  public getLiveChat() {
    return this.socket.fromEvent("send_chat_to_client").map( data => data['chat']);
  }

  public getViewer() {
    return this.socket.fromEvent("send_viewer_to_client").map( data => data['viewer']);
  }

  public getLikes() {
    return this.socket.fromEvent("send_like_to_client").map( data => data['likes']);
  }

}
