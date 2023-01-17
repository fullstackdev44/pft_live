import { Component, OnInit, ViewChild, Output, Input, EventEmitter,NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Video } from '../../shared/models/video';
import { CategoryService } from '../../shared/services/category.service';
import { CommonComponent } from '../../shared/mock/component';
import { Category } from '../../shared/models/category';
import { VideoService } from '../../shared/services/video.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenService } from '../../shared/authentication/token.service';
import { User } from '../../shared/models/user';
import { ChannelService } from '../../shared/services/channel.service';
import {MatDatepicker} from '@angular/material/datepicker';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import * as moment from 'moment';
import {MatSnackBar} from '@angular/material/snack-bar';
@Component({
  selector: 'pft-live-event',
  templateUrl: './live-event.component.html',
  styleUrls: ['./live-event.component.css']
})
export class LiveEventComponent extends CommonComponent implements OnInit {
  @ViewChild('startDatepicker') startDatepicker: MatDatepicker<Date>;
  @ViewChild('endDatePicker') endDatepicker: MatDatepicker<Date>;
  @Output() dropped = new EventEmitter<FileList>();
  @Output() hovered = new EventEmitter<boolean>();
  public live: Video = new Video();
  public event_date: Date = new Date();
  public event_hour: any;
  public categories: any[] = [];
  public schedule_for_later: string = 'YES';
  public user: User = new User();
  public user_channel_id = null;
  public maxNoPeople: number;
  public startTime: string;
  public minimumTime:string;
  public minimumDate:Date;
  public edit_live: boolean = false;
  public submit_form = false;
  public timeList: any = [];

  public lives: Video[] = [];

  public image_size_error: boolean = false;

  constructor(
    private categoryService: CategoryService,
    private liveService: VideoService,
    private router: Router,
    private tokenService: TokenService,
    private channelService: ChannelService,
    private route: ActivatedRoute,
  ) {
    super();
    this.live.live_info = {
      start: new Date(),
      end: new Date,
      auto_start: false,
      status: 'UPCOMMING',
      live_thumbnail: null,
      roomName: '',
      maxNoPeople:50,
    };
  }

  ngOnInit() {
    this.minimumDate = new Date();
    this.minimumTime = moment().format('LT');
    if (!(this.tokenService.user && this.tokenService.user._id)) this.router.navigate(['/login']);

    this.initData(this.lives, this.liveService.getUserUpcommingAndCurrentLives());

    this.channelService.getMyChannels().subscribe(
      data => {
        if(Object.keys(data).length >0){
        this.user_channel_id = data[0]._id;
        if(!this.live.channel_id){
          this.live.channel_id = this.user_channel_id;
        }
      }
      }, error => {
        console.log(error);
      });

    this.initData(this.categories, this.categoryService.getAllCategoriesMin(), () => {

      this.route.params.subscribe(params => {

        if (params.live_id) {
          this.edit_live = true;
          this.initData(this.live, this.liveService.getVideoDetail(params.live_id),() => {
            if (this.live.live_info.auto_start && this.live.live_info.auto_start == true) {
              this.schedule_for_later = 'NO';
            } else {
              this.schedule_for_later = 'YES';
              this.event_date = new Date(this.live.live_info.start);
              let hours: any = this.event_date.getHours();
              let minutes: any = this.event_date.getMinutes();
              var AmOrPm = hours >= 12 ? 'PM' : 'AM';
              hours = (hours % 12) || 12;
              hours = ( "0" + hours.toString() ).slice(-2);
              minutes = ( "0" + minutes.toString() ).slice(-2);
              this.event_hour = hours + ":" + minutes + " " + AmOrPm;
              this.maxNoPeople = this.live.live_info.maxNoPeople;
            }
            // categories in view
            this.live.categories.forEach(live_category => {
              const index = this.categories.map(category => category._id).indexOf(live_category.toString());
              if(index > -1){
                this.categories[index].checked = true;
              }
            })
          });
        }
        else{
          this.initData(this.lives, this.liveService.getUserUpcommingAndCurrentLives());
        }
      });
    });

    // 24h format (transformed into 12h format)
    for (let t = 0; t <= 1; t++){
      for (let i = 0; i <= 11; i++){
        for (let j = 0; j <= 55; j+=5){
          let am_pm = '';
          let set_0_to_12;
          if(t == 0) {
            am_pm = 'AM';
          } else if(t == 1) {
            am_pm = 'PM';
          }
          set_0_to_12 = i == 0 ? 12 : i;
          this.timeList.push( ("0" + set_0_to_12).slice(-2) + ':' + ( "0" + j).slice(-2) + ' ' + am_pm );
        }
      }
    }

  }

  filePrepare(event) {
    const logo_image_file = event.target.files[0];
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(logo_image_file);
    reader.onload = (e) => {
      this.live.live_info.live_thumbnail = reader.result as string;
    };
  }

  create_live() {
    this.live.live_status = true;
    this.submit_form = true;
    if (this.live.monetize == true) {
      if(!this.live.price) {
        return;
      }
    } else if (this.live.monetize == false) {
      this.live.price = 0;
    }
    if(!this.maxNoPeople){
      this.maxNoPeople = 50;
    }
    if (this.schedule_for_later == 'YES') {
      if (!this.event_hour) {
        document.getElementById('starttimeerror').style.display = 'inline-block';
        //console.log(this.event_hour);
            return;
        }else{
          document.getElementById('starttimeerror').style.display = 'none';
        }
      this.event_date = new Date(this.event_date);
      let start_date = ( this.event_date.getMonth() + 1 ) + '/' + this.event_date.getDate() + '/' + this.event_date.getFullYear() + ', ' + this.event_hour;
      //  console.log(start_date);
      this.live.live_info.start = new Date(start_date);
      this.live.live_info.maxNoPeople = this.maxNoPeople;
      this.live.live_info.auto_start = false;
    } else if (this.schedule_for_later == 'NO') {
      this.live.live_info.start = new Date();
      this.live.live_info.auto_start = true;
    }

    this.live.user_id = this.tokenService.user._id;
    this.live.channel_id = this.user_channel_id;
    this.liveService.createVideo(this.live).subscribe(
      data => {
        this.submit_form = false;
        if (this.schedule_for_later == 'NO') {
          this.router.navigate(['/live/go/' + data._id ]);
        } else {
          this.router.navigate(['/user-account/live']);
        }
      }, error => {
        if (error['code'] == "ERR_OUT_OF_RANGE") {
          this.image_size_error = true;
        }
        console.log(error);
      }
    );
  }

  update_live() {
    this.submit_form = true;
    if (this.live.monetize == true) {
      if(!this.live.price) {
        return;
      }
    } else if (this.live.monetize == false) {
      this.live.price = 0;
    }
    if (this.schedule_for_later == 'YES') {
      if(!this.event_hour) {
        return;
      }
    if(!this.maxNoPeople){
      this.maxNoPeople = 50;
    }
      this.event_date = new Date(this.event_date);
      let start_date = ( this.event_date.getMonth() + 1 ) + '/' + this.event_date.getDate() + '/' + this.event_date.getFullYear() + ', ' + this.event_hour;
      this.live.live_info.start = new Date(start_date);
      this.live.live_info.auto_start = false;
      this.live.live_info.maxNoPeople = this.maxNoPeople;
    } else if (this.schedule_for_later == 'NO') {
      this.live.live_info.start = null;
      this.live.live_info.auto_start = true;
    }

    this.liveService.updateVideo(this.live).subscribe(
      data => {
        if (this.schedule_for_later == 'NO') {
          this.router.navigate(['/live/go/' + this.live._id ]);
        } else {
          this.router.navigate(['/user-account/live']);
        }
      }, error => {
        if (error['code'] == "ERR_OUT_OF_RANGE") {
          this.image_size_error = true;
        }
        console.log(error);
      }
    );
  }

  checkbox_clicked(event: any, category: Category) {
    if (event.target.checked == true) {
      this.live.categories.push(category);
    } else {
      const category_index = this.live.categories.map(current => current._id).indexOf(category._id);
      this.live.categories.splice(category_index, 1);
    }
  }

  goLiveNow(live_id: string){
    this.router.navigate(['/live', 'go', live_id]);
  }

}
