import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { LiveVideoRoutingModule } from './live-video-routing.module';

import { LiveVideoComponent } from './live-video.component';
import { SingleLiveComponent } from './single-live/single-live.component';
import { GoLiveComponent } from './go-live/go-live.component';
import { LiveEventComponent } from './live-event/live-event.component';
import {MatSelectModule} from '@angular/material/select';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatIconModule} from '@angular/material/icon';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatMenuModule} from '@angular/material/menu';
import {MatListModule} from '@angular/material/list';
import {MatRadioModule} from '@angular/material/radio';
import {MatCardModule} from '@angular/material/card';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatBadgeModule} from '@angular/material/badge';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import {MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';

@NgModule({
  declarations: [LiveVideoComponent, SingleLiveComponent, GoLiveComponent, LiveEventComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    MatSelectModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    FlexLayoutModule,
    MatIconModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatSidenavModule,
    MatMenuModule,
    MatListModule,
    MatRadioModule,
    MatCardModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatBadgeModule,
    NgxMaterialTimepickerModule,
    MatTableModule,
    MatCheckboxModule,
    LiveVideoRoutingModule
  ]
})
export class LiveVideoModule { }
