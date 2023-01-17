import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CanDeactivateGuard } from '../shared/guard/can-deactivate.guard';

import { LiveVideoComponent } from './live-video.component';
import { SingleLiveComponent } from './single-live/single-live.component';
import { GoLiveComponent } from './go-live/go-live.component';
import { LiveEventComponent } from './live-event/live-event.component';

const routes: Routes = [
  {
    path: '',
    component: LiveVideoComponent
  },
  {
    path: 'go/:live_id',
    component: GoLiveComponent,
    canDeactivate: [CanDeactivateGuard]
  },
  {
    path: 'event',
    component: LiveEventComponent
  },
  {
    path: 'event/:live_id',
    component: LiveEventComponent
  },
  {
    path: ':live_id',
    component: SingleLiveComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LiveVideoRoutingModule { }
