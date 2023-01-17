import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

import { ChannelRoutingModule } from './channel-routing.module';
import { ChannelComponent } from './channel.component';
import { ChannelService } from '../shared/services/channel.service';
import { ChannelDetailComponent } from './channel-detail/channel-detail.component';

@NgModule({
  declarations: [ChannelComponent, ChannelDetailComponent],
  imports: [
    CommonModule,
    ChannelRoutingModule,
    FormsModule,
    SharedModule
  ],
  providers: [
  	ChannelService
  ]
})
export class ChannelModule { }
