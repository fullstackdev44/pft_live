import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WatchLaterComponent } from './watch-later.component';


const routes: Routes = [
  {
    path: '',
    component: WatchLaterComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WatchLaterRoutingModule { }
