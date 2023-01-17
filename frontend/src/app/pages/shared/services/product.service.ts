import { Injectable } from '@angular/core';

import { resolveProduct, resolveProducts } from '../mock/product';
import { ApiService } from '../mock/service';

import { Product } from '../models/product';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends ApiService{

  private productUrl = environment.config.API_BASE_URL + '/product';

  @resolveProducts(20)
  getChannelProducts(channel_id: string): Observable < Product > {
    return this.query("get", this.productUrl + '/channel/' + channel_id);
  }

  @resolveProducts(7)
  liveUsedProducts(live_id: string): Observable < Product > {
    return this.query("get", this.productUrl + '/used/' + live_id);
  }
}
