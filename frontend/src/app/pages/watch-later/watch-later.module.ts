import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WatchLaterRoutingModule } from './watch-later-routing.module';
import { WatchLaterComponent } from './watch-later.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [WatchLaterComponent],
  imports: [
    CommonModule,
    WatchLaterRoutingModule,
    SharedModule
  ]
})
export class WatchLaterModule { }
