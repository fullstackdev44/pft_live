import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LikedVideoComponent } from './liked-video.component';


const routes: Routes = [
  {
    path: '',
    component: LikedVideoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LikedVideoRoutingModule { }
