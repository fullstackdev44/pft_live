import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChannelComponent } from './channel.component';
import { ChannelDetailComponent } from './channel-detail/channel-detail.component';

const routes: Routes = [
  {
    path: '',
    component: ChannelComponent
  },
  {
  	path: ':id',
  	component: ChannelDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChannelRoutingModule { }
