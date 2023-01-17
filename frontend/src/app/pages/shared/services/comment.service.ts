import { Injectable } from '@angular/core';

import { ApiService } from '../mock/service';

import { Comment } from '../models/comment';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentService extends ApiService {

  private commentUrl = environment.config.API_BASE_URL + '/comment';

  getAllComments(): Observable < Comment[] > {
    return this.query('get', this.commentUrl);
  }

  createVideoComment(comment: Comment): Observable < string > {

    // I didn't know who write this here and what it is need for
    // but it cause a bug for my subcomment in single_video_page
    // so I just comment it out for now
    /*let payload = { comment: comment.comment, video_id: null };
    payload.video_id = comment.video_id._id || comment.video_id;*/

    return this.query('post', this.commentUrl + "/video", comment);
  }

  getCommentDetail(id: string): Observable < Comment > {
    return this.query('get', this.commentUrl + '/id/' + id);
  }

  updateComment(comment: Comment): Observable < Comment > {
    return this.query('put', this.commentUrl, comment);
  }

  deleteComment(comment: Comment): Observable < Comment > {
    return this.query('delete', this.commentUrl + '/' + comment._id);
  }

  getVideoCommentsHistory(): Observable < Comment[] > {
    return this.query('get', this.commentUrl + '/byVideo');
  }

  getVideoCommentsHistoryWithSkipOption(skip_otion: number): Observable < Comment[] > {
    return this.query('get', this.commentUrl + '/byVideoWithSkipOption/' + skip_otion);
  }

  getVideoComments(id: string): Observable < Comment[] > {
    return this.query('get', this.commentUrl + '/video/' + id);
  }

  getLiveChats(id: string): Observable < Comment[] > {
    return this.query('get', this.commentUrl + '/liveChat/' + id);
  }
}
