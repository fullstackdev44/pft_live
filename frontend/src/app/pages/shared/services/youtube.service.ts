import { HttpClient, HttpEvent, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

const YOUTUBE_ACCESS_TOKEN = "ya29.Il-vB8cgNBc7q7oUL4mGMcm99ZvtVhFEr1OnTTxl8z5-01pnyXvn5j_GMQtXsGG4aCAd9w11vP6N5XBqEBqvS6uP_Iy1AHkoMtVFu27WAitbN-8M7od9oVbLpFu4eQJksg";

@Injectable({
  providedIn: 'root'
})
export class YoutubeService {

  // https://developers.google.com/youtube/v3/guides/using_resumable_upload_protocol
  private YOUTUBE_API_URL = "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status,contentDetails";

  constructor(private http: HttpClient) { }

  // -----------------------------------------------
  // Prepare the youtube video to get the upload link
  // -----------------------------------------------
  prepareUpload(options: any): Observable<any> {
    const headers = new HttpHeaders({'Authorization': 'bearer ' + YOUTUBE_ACCESS_TOKEN});
    headers.append('Content-Type', 'application/json; charset=UTF-8');
    //headers.append('Content-Length', options.size);
    headers.append('X-Upload-Content-Length', options.size);
    headers.append('X-Upload-Content-Type', options.content_type);

    const body = {
      "snippet": {
        "title": options.title,
        "description": options.description,
        "tags": ["cool", "video", "more keywords"],
        "categoryId": 22
      },
      "status": {
        "privacyStatus": "unlisted",
        "embeddable": true,
        "license": "youtube"
      }
    }

    return this.http.post(this.YOUTUBE_API_URL, body, { headers: headers});
  }

  // ---------------------------------
  // Upload video
  // ---------------------------------
  upload(upload_link: string, file: File): Observable<HttpEvent<any>> {
    
    const file_size = file.size.toString();
    const headers = new HttpHeaders({'Authorization': 'bearer ' + YOUTUBE_ACCESS_TOKEN});
    headers.append('Content-Length', file_size);
    headers.append('Content-Type', 'video/*');

    const req = new HttpRequest('PUT', upload_link, file, { headers: headers});
    return this.http.request(req);
  }

}
