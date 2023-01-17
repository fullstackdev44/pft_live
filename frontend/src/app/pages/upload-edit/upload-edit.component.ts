import { Component, OnInit } from '@angular/core';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

import { CommonComponent } from '../shared/mock/component';

import { DomSanitizer } from '@angular/platform-browser';

import { Video } from '../shared/models/video';
import { Product } from '../shared/models/product';
import { TokenService } from '../shared/authentication/token.service';
import { ChannelService } from '../shared/services/channel.service';
import { VideoService } from '../shared/services/video.service';
import { VimeoService } from '../shared/services/vimeo.service';

import { map, switchMap } from 'rxjs/operators';

import { Channel } from '../shared/models/channel';
import { Category } from '../shared/models/category';
import { CategoryService } from '../shared/services/category.service';

const NUM_PRODUCTS = 4;

@Component({
  selector: 'pft-upload-edit',
  templateUrl: './upload-edit.component.html'
})
export class UploadEditComponent extends CommonComponent implements OnInit {

  public video: Video = new Video();
  public selected_file: any;
  public selected_file_path: any;

  public upload_loading: boolean = false;
  private user_id: string = "";
  // Track upload status by tracking code
  // 0 - Not started
  // 1 - File chosen
  // 2 - Wrong file type
  // 3 - Uploading
  // 4 - Upload error
  // 5 - Upload complete
  public upload_status: number = 0;
  private vimeo_reponse: any;
  public upload_percent: number = 0;
  public categories: any[] = [];

  public is_edit: boolean = false;
  public user_channels: Channel[] = [];
  public video_new_product: Product = new Product();
  public multi_channel: boolean = true;

  public upload_processing: boolean = false;
  public submit_form = false;

  constructor(
    private channelService: ChannelService,
    private videoService: VideoService,
    private tokenService: TokenService,
    private vimeoService: VimeoService,
    private router: Router,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer) {
    super();
  }

  async ngOnInit() {

    const token = this.tokenService.decodeUserToken();
    this.user_id = token._id;

    await this.initData(this.categories, this.categoryService.getAllCategoriesMin());

    // ------------------------------------------------------
    // Case: edit of existed video (it works!)
    // ------------------------------------------------------
    this.route.params.subscribe(params => {

      if (params.video_id) {

        this.is_edit = true;

        this.initData(this.user_channels, this.channelService.getMyChannels(), () => {
          this.initData(this.video, this.videoService.getVideoDetail(params.video_id), () => {
            // make video channel selected by default in view
            this.video.channel_id = this.user_channels.length ? this.user_channels[0] : null;
            // categories in view
            this.video.categories.forEach(video_category => {
              const index = this.categories.map(category => category._id).indexOf(video_category.toString());

              if(index > -1){
                this.categories[index].checked = true;
              }
            })
          })
        });
      }
      else {

        this.selected_file = this.vimeoService.getVideoData();

        // console.log(this.selected_file);

        if(this.selected_file){

          this.selected_file_path =  this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.selected_file));
          this.video.title = this.selected_file.name.substring(0, this.selected_file.name.lastIndexOf('.')) || this.selected_file.name;

          // set the channel by default
          this.initData(this.user_channels, this.channelService.getMyChannels(), () => {
            this.video.channel_id = this.user_channels.length ? this.user_channels[0] : null;
          });
        }
        else {
          // impossible route
          this.router.navigate(['/', "upload-video"]);
        }
      }

      // if (!this.video.products || this.video.products.length == 0) {
      //   this.video.products = new Array<Product>(NUM_PRODUCTS); // initialize 4 products
      // }
    })
  }

  addMoreProduct(){
    if(this.video_new_product.name && this.video_new_product.link && this.video_new_product.image){
      this.video.products.push(this.video_new_product);
      this.video_new_product = new Product();
    }
  }

  // -------------------------
  // Upload video to vimeo
  // -------------------------
  upload() {

    this.submit_form = true;
    if (!this.video.title) {
      return;
    }
    if (this.video.monetize == true) {
      if (!this.video.price) {
        return;
      }
    } else if (this.video.monetize == false) {
      this.video.price = 0;
    }

    if(!this.upload_processing){

      // reset scroll
      window.scroll({top: 0, behavior: 'smooth'});

      // deactivate button
      this.upload_loading = true;
      this.upload_processing = true;

      if (!this.video._id) {
        this.submit_form = false;
        const options = {
          name: this.video.title, /*this.selected_file.name,*/
          description: this.video.description,
          size: this.selected_file.size
        };

        this.upload_status = 1;
        // console.log(options);
        // console.log(this.video);

        this.vimeoService.prepareUpload(options)
          .pipe(
            map(response => {
              //this.vimeo_reponse = response.data.body;
              this.vimeo_reponse = response.body;
              // console.log("---------RESPONSE----------");
              // console.log(response);
              // console.log("----------RESPONSE---------");
            }),
            switchMap(
              () => {
                // console.log("log response");
                // console.log(this.vimeo_reponse);
                if (this.vimeo_reponse.upload.size === this.selected_file.size) {
                  // console.log("uploading now ...")
                  return this.vimeoService.upload(this.vimeo_reponse.upload.upload_link, this.selected_file);
                } else {
                  this.upload_status = 4;
                }
              }
            )
          )
          .subscribe(
            event => {
              if (event.type === HttpEventType.UploadProgress) {
                this.upload_percent = Math.round(100 * event.loaded / event.total);
                this.upload_status = 3;
              } else if (event instanceof HttpResponse) {
                this.video.source_id  = this.vimeo_reponse.uri.replace("/videos/", "");
                this.video.user_id    = this.user_id;
                //video.embed_url  = response.embed.html;
                // console.log("---------- UPLOAD RESPONSE -------------");
                // console.log(event);
                // console.log("---------- UPLOAD RESPONSE WOW -------------");
                this.postVideoInfosToBackend(this.video);
              }
            },
            (error) => {
              // console.log('Upload Error:', error);
              this.upload_status = 4;
            }, () => {
              // console.log('Upload done');
            }
          );
      } else {
        this.submit_form = false;
        this.updateVideoInfosToBackend(this.video);
      }
    }
 }

  // ---------------------------
  // Sending videos to backend
  // ---------------------------
  postVideoInfosToBackend(video: Video){
    this.videoService.createVideo(video).subscribe(
      data => {
        // console.log("Posted infos about vimeo video to backend");
        // console.log(data);
        this.upload_status = 5;
        setTimeout(() => {
          this.upload_status = 0;
        }, 10000);
        this.router.navigate(['/user-account']);
      },
      error => {
        // console.log("Error" + error);
        this.upload_status = 4;
      }
    )
  }

  // ---------------------------
  // Update video info in backend
  // ---------------------------
  updateVideoInfosToBackend(video: Video) {
    this.videoService.updateVideo(video).subscribe(
      data => {
        // console.log("Update infos about video in backend");
        this.router.navigate(['/user-account']);
      },
      error => {
        // console.log("Error" + error);
      }
    );
  }

  humanFileSize(size: number) {
    var i = Math.floor( Math.log(size) / Math.log(1024) );
    const tmp = parseFloat(( size / Math.pow(1024, i) ).toFixed(2));
    return tmp * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
  }

  checkbox_clicked(event: any, category: Category) {
    if (event.target.checked == true) {
      this.video.categories.push(category);
    } else {
      const category_index = this.video.categories.map(current => current._id).indexOf(category._id);
      this.video.categories.splice(category_index, 1);
    }
  }
  
}
