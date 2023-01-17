import { Component, OnInit } from '@angular/core';
import { VimeoService } from '../shared/services/vimeo.service';
import { Router } from '@angular/router';

@Component({
  selector: 'pft-upload-video',
  templateUrl: './upload-video.component.html',
  styleUrls: ['./upload-video.component.css']
})
export class UploadVideoComponent implements OnInit {

  public selected_file: any;
  public upload_status = undefined;

  constructor(
    private vimeoService: VimeoService,
    private router: Router
  ) {}

  ngOnInit() {
  }

  prepareFile(event: any) {
    this.selected_file = event.target.files[0];
    this.vimeoService.setVideoData(this.selected_file);
  }

  prepareDroppedFile(event: any) {
    this.selected_file = event[0];
    this.vimeoService.setVideoData(this.selected_file);
  }

  upload(){
    if (this.selected_file) {
      // console.log(this.selected_file);
      this.router.navigate(['/upload-edit']);
    }
  }
}
