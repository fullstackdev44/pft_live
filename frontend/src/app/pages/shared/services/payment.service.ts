import { Injectable } from '@angular/core';

import { resolveProduct, resolveProducts } from '../mock/product';
import { ApiService } from '../mock/service';

import { Product } from '../models/product';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService extends ApiService{

  private paymentUrl = environment.config.API_BASE_URL + '/payment';

  initiatePayment(data: any): Observable < any > {
    return this.query("post", this.paymentUrl + '/initiate', data);
  }

  getStripePublicKey(): Observable<any> {
    return this.query("get", this.paymentUrl + '/stripe_public_key');
  }

  getUserPaymentNotYetComputed(): Observable<any> {
    return this.query("get", this.paymentUrl + '/not_yet_computed');
  }

  addPaymentToReceiver(payments: string[]) {
    return this.query("post", this.paymentUrl + '/addPaymentToReceiver', payments);
  }
  updatePurchaseVid(user_id:string,video_id:string){
    return this.query("post", this.paymentUrl + '/updatePurchaseVid', {user_id: user_id,video_id: video_id});
  }
  checkMaxParticipants(user_id:string,video_id:string){
    return this.query("post", this.paymentUrl + '/checkMaxParticipants', {user_id: user_id,video_id: video_id});
  }

}
