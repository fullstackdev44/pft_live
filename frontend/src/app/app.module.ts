import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { TopbarModule } from './pages/shared/topbar/topbar.module';

import { HttpClientModule } from '@angular/common/http';
import { AuthenticationModule } from './pages/shared/authentication/authentication.module';
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
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// import { AngularFireModule } from 'angularfire2';
// import { AngularFireAuth } from 'angularfire2/auth';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    TopbarModule,
    AuthenticationModule,
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
    BrowserAnimationsModule
    // AngularFireModule.initializeApp(environment.config.FIREBASE)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

