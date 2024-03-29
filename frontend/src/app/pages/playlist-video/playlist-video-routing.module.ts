import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlaylistVideoComponent } from './playlist-video.component';


const routes: Routes = [
  {
    path: '',
    component: PlaylistVideoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlaylistVideoRoutingModule { }
