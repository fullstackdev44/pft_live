import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UpdatesFromSubsComponent } from './updates-from-subs.component';


const routes: Routes = [
  {
    path: '',
    component: UpdatesFromSubsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UpdatesFromSubsRoutingModule { }
