import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// import { HTTP_INTERCEPTORS } from '@angular/common/http';
// import { UploadInterceptor } from './upload.interceptor';

import { SharedModule } from '../shared/shared.module';

import { UploadVideoRoutingModule } from './upload-video-routing.module';
import { UploadVideoComponent } from './upload-video.component';

@NgModule({
	declarations: [UploadVideoComponent],
	imports: [
		CommonModule,
		FormsModule,
		SharedModule,
		UploadVideoRoutingModule
	],
	// providers: [{
	// 	provide: HTTP_INTERCEPTORS,
	// 	useClass: UploadInterceptor,
	// 	multi: true,
	// }]
})
export class UploadVideoModule {}
