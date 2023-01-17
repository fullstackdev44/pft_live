import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchVideoComponent } from './search-video.component';


const routes: Routes = [
  {
    path: '',
    component: SearchVideoComponent
  },
  {
    path: ':term',
    component: SearchVideoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchVideoRoutingModule { }
