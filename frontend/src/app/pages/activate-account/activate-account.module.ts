import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActivateAccountRoutingModule } from './activate-account-routing.module';
import { ActivateAccountComponent } from './activate-account.component';

@NgModule({
  exports: [ActivateAccountComponent],
  declarations: [ActivateAccountComponent],
  imports: [
    CommonModule,
    ActivateAccountRoutingModule
  ]
})
export class ActivateAccountModule { }
