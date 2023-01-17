import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UploadVideoComponent } from './upload-video.component';


const routes: Routes = [
  {
    path: '',
    component: UploadVideoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UploadVideoRoutingModule { }
