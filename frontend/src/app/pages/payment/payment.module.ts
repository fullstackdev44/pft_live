import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule }   from '@angular/forms';

import { PaymentRoutingModule } from './payment-routing.module';
import { PaymentComponent } from './payment.component';
// import { AngularFireAuth } from 'angularfire2/auth';


@NgModule({
  exports: [PaymentComponent],
  declarations: [PaymentComponent],
  imports: [
    CommonModule,
    PaymentRoutingModule,
    FormsModule,
    ReactiveFormsModule
  // ], providers: [AngularFireAuth]
  ], providers: []
})
export class PaymentModule { }
