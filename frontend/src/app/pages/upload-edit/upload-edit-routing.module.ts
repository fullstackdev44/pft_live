import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UploadEditComponent } from './upload-edit.component';


const routes: Routes = [
  {
    path: '',
    component: UploadEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UploadEditRoutingModule { }
