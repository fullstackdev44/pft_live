import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UpdatesFromSubsRoutingModule } from './updates-from-subs-routing.module';
import { UpdatesFromSubsComponent } from './updates-from-subs.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [UpdatesFromSubsComponent],
  imports: [
    CommonModule,
    UpdatesFromSubsRoutingModule,
    SharedModule
  ]
})
export class UpdatesFromSubsModule { }
