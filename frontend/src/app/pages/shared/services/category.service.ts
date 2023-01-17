import { Injectable } from '@angular/core';

import { ApiService } from '../mock/service';

import { Category } from '../models/category';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends ApiService {

  private categoryUrl = environment.config.API_BASE_URL + '/category';

  getAllCategoriesMin(): Observable < Category[] > {
    return this.query('get', this.categoryUrl + '/min');
  }

  getAllCategories(): Observable < Category[] > {
    return this.query('get', this.categoryUrl + '/getAllCategories');
  }

  getCategory(id: string): Observable < Category > {
    return this.query('get', this.categoryUrl + '/id/' + id);
  }

  countVideo(): Observable < any > {
    return this.query('get', this.categoryUrl + '/countVideo');
  }

  countVideoForCategory(id: string): Observable < any > {
    return this.query('get', this.categoryUrl + '/countVideoForCategory/' + id);
  }
}
