import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SingleVideoComponent } from './single-video.component';

import { CanDeactivateGuard } from '../shared/guard/can-deactivate.guard';

const routes: Routes = [
  {
    path: '',
    component: SingleVideoComponent,
    canDeactivate: [CanDeactivateGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SingleVideoRoutingModule { }
