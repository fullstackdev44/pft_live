import { Injectable } from '@angular/core';

import { ApiService } from '../mock/service';

import { Notify } from '../models/notify';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotifyService extends ApiService  {

  private notificationUrl = environment.config.API_BASE_URL + '/notification';
  private total_notification_unread: number = undefined;

  getTotal_notification_unread () {
    return this.total_notification_unread;
  }

  setTotal_notification_unread(value: any) {
    return this.total_notification_unread = value;
  }

  getUnreadNotification(): Observable < Notify[] > {
    return this.query('get', this.notificationUrl + '/unread');
  }

  getAllNotifications(): Observable < Notify[] > {
    return this.query('get', this.notificationUrl);
  }

  createNotification(notification: Notify): Observable < Notify > {
    return this.query('post', this.notificationUrl, notification);
  }

  changeNotificationStatus(notification_id, status): Observable < Notify[] > {
    return this.query('get', this.notificationUrl + '/changeStatus/' + notification_id + '/' + status);
  }

  changeNotificationStatusForAll(notifications, status): Observable < Notify[] > {
    const notification_ids = [];
    notifications.map(current => {
      notification_ids.push(current._id);
    });
    return this.query('post', this.notificationUrl + '/changeStatusForAll/', {notification_ids: notification_ids, status: status});
  }
}
