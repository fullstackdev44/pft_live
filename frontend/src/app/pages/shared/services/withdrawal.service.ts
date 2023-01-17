import { Injectable } from '@angular/core';

import { ApiService } from '../mock/service';

import { Withdrawal } from '../models/withdrawal';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WithdrawalService extends ApiService {

  private withdrawalUrl = environment.config.API_BASE_URL + '/withdrawal';

  getAllWithdrawal(): Observable < Withdrawal[] > {
    return this.query('get', this.withdrawalUrl);
  }

  getWithdrawalWithSkipOption(skip_option: number): Observable < Withdrawal[] > {
    return this.query('get', this.withdrawalUrl+ '/withdrawalWithSkipOption/' + skip_option);
  }

  createWithdrawal(withdrawal: Withdrawal): Observable < Withdrawal > {
    return this.query('post', this.withdrawalUrl, withdrawal);
  }

  getWithdrawalDetail(id: string): Observable < Withdrawal > {
    return this.query('get', this.withdrawalUrl + '/detail/' + id);
  }

  updateWithdrawal(withdrawal: Withdrawal): Observable < any > {
    return this.query('put', this.withdrawalUrl, withdrawal);
  }

  deleteWithdrawal(withdrawal: Withdrawal): Observable < string > {
    return this.query('delete', this.withdrawalUrl + '/' + withdrawal._id);
  }

}
