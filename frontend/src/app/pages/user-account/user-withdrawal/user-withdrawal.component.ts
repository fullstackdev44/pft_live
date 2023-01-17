import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { WithdrawalService } from '../../shared/services/withdrawal.service';
import { Withdrawal } from '../../shared/models/withdrawal';
import { TokenService } from '../../shared/authentication/token.service';
import { User } from '../../shared/models/user';
import { PaymentService } from '../../shared/services/payment.service';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'pft-user-withdrawal',
  templateUrl: './user-withdrawal.component.html'
})
export class UserWithdrawalComponent implements OnInit {

  public amount: number;
  public withdrawal = new Withdrawal();
  public withdrawals : Withdrawal[] = [];
  public user: User;
  public user_balance = undefined;
  public skip_option: number = 0;
  public show_button: any[] = [false, false];
  public init_call: boolean = true;
  public show_modal = false;
  public insufficient_funds_error: boolean = false;
  public email_missing: boolean = undefined;
  public amount_missing: boolean = undefined;

  constructor(
    private withdrawalService: WithdrawalService,
    private tokenService: TokenService,
    private paymentService: PaymentService,
    private userService: UserService,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    this.computeUserBalance();
    this.lastest_withdrawals();
  }

  computeUserBalance() {
    this.paymentService.getUserPaymentNotYetComputed().subscribe(
      data_payment => {

        this.userService.getUserDetailNoPopulate(this.tokenService.user._id).subscribe(
          data_user => {
            this.user = data_user;
            let user_money = 0;
            if (data_payment && data_payment.length > 0) {
              let payment_to_be_computed = [];
              data_payment.map(current_data => {
                user_money += current_data.amount;
                current_data.added_to_receiver_money = true;
                payment_to_be_computed.push(current_data._id);
              });

              this.user_balance = (this.user.money ? this.user.money : 0) + user_money;

              if(this.user.money != this.user_balance) {
                this.user.money = this.user_balance;
                this.userService.updateUser(this.user, ["money"]).subscribe(
                  updated_user => {

                  }, error_update => {
                    console.log(error_update);
                  }
                );
              }

              this.paymentService.addPaymentToReceiver(payment_to_be_computed).subscribe(
                data_payment_updated => {

                }, error_payment_update => {
                  console.log(error_payment_update);
                }
              );

            } else {
              this.user_balance = this.user.money;
            }
          }, error_user => {
            console.log(error_user);
          }
        );
      }, error_payment => {
        console.log(error_payment);
      }
    );
  }

  createWithdrawal() {
    this.email_missing = undefined;
    this.amount_missing = undefined;
    if (this.withdrawal.amount && this.withdrawal.amount > 0) {
      if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.withdrawal.paypal_email)) { // validate email format
        if (this.user_balance - this.withdrawal.amount >= 0) {
          this.withdrawal.user = this.tokenService.user;
          this.withdrawal.status = 'PENDING';
          this.withdrawalService.createWithdrawal(this.withdrawal).subscribe(
            data => {
              this.email_missing = false;
              this.withdrawal.created = data.created;
              if (this.skip_option < 0 || this.skip_option == 0) {
                this.withdrawals.unshift(this.withdrawal);
              }
              if (this.withdrawals.length >= 10) {
                this.withdrawals.splice(this.withdrawals.length - 1, 1);
              }
              this.user.money = this.user_balance - this.withdrawal.amount;
              this.user_balance = this.user.money;
              this.withdrawal = new Withdrawal();
              this.hideConfirmationModal();

              this.userService.updateUser(this.user, ["money"]).subscribe(
                updated_user => {

                }, error_update => {
                  console.log(error_update);
                }
              );
            }, error => {
              console.log(error);
            }
          );
        } else {
          this.insufficient_funds_error = true;
          this.hideConfirmationModal();
        }
      } else {
        this.email_missing = true;
      }
    } else {
      this.amount_missing = true;
    }
  }

  showConfirmationModal() {
    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    this.show_modal = true;
  }

  hideConfirmationModal(){
    this.renderer.removeClass(document.body, 'overlay');
    this.show_modal = false;
    this.withdrawal = new Withdrawal();
  }

  lastest_withdrawals() {
    this.withdrawalService.getWithdrawalWithSkipOption(this.skip_option).subscribe(
      data => {
        this.withdrawals = data;
        if (this.withdrawals.length >= 10) {
          this.show_button[1] = true;
        }
      }, error => {
        console.log(error);
      }
    );
  }

  next_list() {
    this.skip_option += 10;
    this.withdrawalService.getWithdrawalWithSkipOption(this.skip_option).subscribe(
      data => {
        data.length >= 10 ? this.show_button[1] = true : this.show_button[1] = false ;
        this.withdrawals = data;
        this.show_button[0] = true;
      }, error => {
        console.log(error);
      }
    );
  }

  previous_list() {
    this.skip_option -= 10;
    if (this.skip_option < 0 || this.skip_option == 0) {
      this.skip_option = 0;
    }
    this.withdrawalService.getWithdrawalWithSkipOption(this.skip_option).subscribe(
      data => {
        this.withdrawals = data;
        if ( this.skip_option < 0 || this.skip_option == 0 ) {
          this.show_button[0] = false;
        }
        this.show_button[1] = true;
      }, error => {
        console.log(error);
      }
    );
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.show_modal == true) {
      if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');
      } else { this.renderer.removeClass(document.body, 'overlay'); }
    }
  }

}
