import { HttpClient, HttpEvent, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ApiService } from '../mock/service';

import {Observable} from 'rxjs/Observable';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VimeoService extends ApiService {

  private BACKEND_VIDEO_URL = environment.config.API_BASE_URL + '/video';
  private video_to_upload: any;

  // -----------------------------------------------
  // Prepare the vimeo video to get the upload link
  // -----------------------------------------------
  prepareUpload(options: any): Observable<any> {
    return this.query('post', this.BACKEND_VIDEO_URL + '/prepareVimeoUpload', options);
  }

  // ---------------------------------
  // Upload video using TUS client
  // ---------------------------------
  upload(upload_link: string, file: File): Observable<HttpEvent<any>> {

    const headers = new HttpHeaders({'Tus-Resumable': '1.0.0', 'Upload-Offset': '0', 'Content-Type': 'application/offset+octet-stream'});
    const params = new HttpParams();
    const options = {
      params: params,
      reportProgress: true,
      headers: headers
    };

    //this.query('patch', upload_link, file, options);

    const req = new HttpRequest('PATCH', upload_link, file, options);
    return this.http.request(req); //
  }

  setVideoData(data){
    this.video_to_upload = data;
  }

  getVideoData(){
    let temp = this.video_to_upload;
    this.clearVideoData();
    return temp;
  }

  clearVideoData(){
    this.video_to_upload = undefined;
  }

}
