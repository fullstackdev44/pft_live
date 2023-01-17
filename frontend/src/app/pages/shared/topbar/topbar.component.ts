import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import { CommonComponent } from '../mock/component';

import { TokenService } from '../authentication/token.service';
import { VideoService } from '../services/video.service';

import { User } from '../models/user';
import { Video } from '../models/video';
// import { AngularFireAuth } from 'angularfire2/auth';

import { Observable } from 'rxjs/Observable';
import { UserService } from '../services/user.service';
import { MessageService } from '../services/message.service';
import { Message } from '../models/message';
import { Location } from '@angular/common';
import { NotifyService } from '../services/notify.service';
import { Notify } from '../models/notify';
import { ChannelService } from '../services/channel.service';
import { Channel } from '../models/channel';
import { ChatService } from '../services/chat.service';

declare var $: any;

@Component({
    selector: 'pft-topbar',
    templateUrl: 'topbar.component.html',
    styleUrls: ['./topbar.component.css']
})

export class TopbarComponent extends CommonComponent implements OnInit, AfterViewInit  {

  public user: User = new User();
  public user_subscriptions: any[] = [];

  // public paused_video: Video = new Video();
  public unread_messages: Message[] | any = [];
  public unread_notifications: Notify[] = [];
  public current_date: Date = new Date();

  public search_term: string = "";
  public total_message_unread_count : number = undefined;
  public total_notification_unread_count : number = undefined;

  public user_channel: Channel = new Channel();

  constructor(
    public tokenService: TokenService,
    public videoService: VideoService,
    private router: Router,
    private messageService: MessageService,
    private notificationService: NotifyService,
    public userService: UserService,
    private location: Location,
    private channelService: ChannelService,
    private chatService: ChatService
  ) {
    super();
  }

  ngOnInit() {

    this.user = this.tokenService.decodeUserToken();
    if(this.user){
      this.userService.getLastPausedVideo();
      this.checkInbox();
      this.getUnreadNotifications();
      this.getUserChannel();

      this.initData(this.user, this.userService.getConnected());
      this.initData(this.user_subscriptions, this.userService.getSubscriptions());

      this.chatService.getMessage().subscribe(
        data => {
          this.initData(this.user, this.userService.getConnected(), () => {
            if (data.message && data.message.length) {
              data.message.map(current => {
                if((current.receiver && current.receiver._id ? current.receiver._id : current.receiver) == this.user._id) {
                  let blocked_user_mapped = this.user.blocked_users.map(current => current.user);
                  let is_blocked = blocked_user_mapped.includes(current.sender);
                  if (!is_blocked) {
                    this.unread_messages.unshift(current);
                  }
                }
              });
            }
          });
        }, error => {
          console.log(error);
        }
      );

      this.chatService.getNotifcation().subscribe(
        data => {
          this.initData(this.user, this.userService.getConnected(), () => {
            if (data.notification && data.notification.length) {
              data.notification.map(current => {
                if((current.receiver && current.receiver._id ? current.receiver._id : current.receiver) == this.user._id) {
                  let blocked_user_mapped = this.user.blocked_users.map(current => current.user);
                  let is_blocked = blocked_user_mapped.includes(current.sender);
                  if (!is_blocked) {
                    this.unread_notifications.unshift(current);
                  }
                }
              });
            }
          });
        }, error => {
          console.log(error);
        }
      );
    }

  }

  ngAfterViewInit(){
    this.startUpScripts();
  }

  startUpScripts() {

    $(function(){

      //  ============= MOBILE RESPONSIVE MENU ===============
      $(".menu-btn").on("click", function(){
        $(this).toggleClass("active");
        $(".responsive-mobile-menu").toggleClass("active");
        $(this).parent().parent().toggleClass("no-br");
      });

      $(".responsive-mobile-menu ul ul").parent().addClass("menu-item-has-children");
      $(".responsive-mobile-menu ul li.menu-item-has-children > a").on("click", function() {
        $(this).parent().toggleClass("active").siblings().removeClass("active");
        $(this).next("ul").slideToggle();
        $(this).parent().siblings().find("ul").slideUp();
        return false;
      });

      //  ============= SETTING HEIGHT  ===============
      var hd_height = $(".top-header").innerHeight();
      $(".responsive-mobile-menu").css({
        "top": hd_height
      });

      //  ============= SEARCH PG  ===============
      $(".search-btn > a").on("click", function(){
        $(".search-page").addClass("active");
      });
      $(".close-search").on("click", function(){
        $(".search-page").removeClass("active");
      });


      $(".login_form_show").on("click", function() {
        $(".form_popup").addClass("opened");
        $(".login_form").addClass("show");
        $(".signup_form").removeClass("show");
        $("body").addClass("overlay");
      });

      $(".show_signup").on("click", function() {
        $(".form_popup").addClass("opened");
        $(".signup_form").addClass("show");
        $(".login_form").removeClass("show");
      });

      /*
      $("body").on("click", function(){
        $(this).removeClass("overlay");
        $(".form_popup").removeClass("opened");
        $(".signup_form").removeClass("show");
        $(".login_form").removeClass("show");
      });
      */

      $(".form_popup, .login_form_show, .show_signup").on("click", function(e){
        e.stopPropagation();
      });

      $(".form_popup .login_form_show").click(function() {
          $(".form_popup").animate({
              scrollTop: $("#login_form").offset().top
          }, 1000);
       });
      $(".form_popup .show_signup").click(function() {
          $(".form_popup").animate({
              scrollTop: $("#signup_form").offset().top
          }, 1000);
       });

      var header_height = $("#top_bar").innerHeight();

      $(".side_menu").css({
        "top" : header_height
      });

      //$(".dp_menu").on("click", function(){

      //  return false;
      //});

      $("html").on("click", function(){
        $(".side_links ul .dp_down").slideUp();
      });

      //$(".side_links ul .dp_down, .dp_menu").on("click", function(e){
      //  e.stopPropagation();
      //});

      /*==============================================
                        SEARCH PAGE
      ===============================================*/
      $(".search_form form button").on("click", function(){
        $(".search-page").addClass("active");
        return false;
      });
      $(".close-search").on("click", function(){
        $(".search-page").removeClass("active");
      });

      //  ==================== SCROLLING FUNCTION ====================
      $(window).on("scroll", function() {
          var scroll = $(window).scrollTop();
          if (scroll > 30) {
              $(".top_bar").addClass("scroll animated slideInDown");
          } else if (scroll < 30) {
              $(".top_bar").removeClass("scroll animated slideInDown")
          }
      });

      $(".menu").on("click", function(){
        $(".side_menu").toggleClass("active");
        return false;
      });

      // hide side menu while clicking main page
      $(document).click( function(e) {
        $(".side_menu").removeClass("active");
      });
    });

  }

  toggleMessageBox(e){
    $(".side_links ul .notification-box.message").slideToggle();
    e.stopPropagation();
  }

  closeMessageNotification() {
    $(".side_links ul .notification-box.message").slideToggle();
  }

  closeNotification() {
    $(".side_links ul .notification-box.notification").slideToggle();
  }

  toggleNotificationBox(e){
    $(".side_links ul .notification-box.notification").slideToggle();
    e.stopPropagation();
  }

  // commented for now, doesn't work very well
  // still need few improvement
  /*toggleNotificationBoxTopBar(e){
    $(".notification.bell .notification-box").slideToggle();
    e.stopPropagation();
  }*/

  dropDownUserMenu(e){
    $(".side_links ul .dp_down").slideToggle();
    e.stopPropagation();
  }

  search(value: string) {
    $(".search-page").removeClass("active");
    this.router.navigate(['/search-video/' + value]);
  }

  navigateTo(value: string) {
    if (this.tokenService.user) {
      this.router.navigate(['/' + value]);
    } else {
      this.router.navigate(['/login/' + value]);
    }
  }

  signOut(){
    if(this.tokenService.logOut()){
      this.router.navigate(['/login']);
    }
  }

  markAllNotificationsAsRead() {
    this.notificationService.changeNotificationStatusForAll(this.unread_notifications, 'READ').subscribe(
      data => {
        this.unread_notifications.map(current => {
          current.status = 'READ';
        });
      }, error => {
        console.log(error);
      }
    );
  }

  markAllMessagesAsRead() {
    this.messageService.changeMessageStatusForAll(this.unread_messages, 'READ').subscribe(
      data => {
        this.unread_messages.map(current => {
          current.status = 'READ';
        });
        this.checkInbox();
      }, error => {
        console.log(error);
      }
    );
  }

  checkInbox() {
    this.messageService.getInbox().subscribe(
      data => {
        let total_message_unread = 0;
        data.map(current => {
          if (current.status != 'READ') {
            total_message_unread += 1;
            this.unread_messages.push(current);
          }
        });
        this.messageService.setTotal_message_unread(total_message_unread);
        this.total_message_unread_count = total_message_unread;
      }, error => {
        console.log(error);
      }
    );
  }

  getUnreadNotifications() {
    this.notificationService.getUnreadNotification().subscribe(
      data => {
        this.unread_notifications = data;
        this.total_notification_unread_count = this.unread_notifications.length;
      }, error => {
        console.log(error);
      }
    );
  }

  view_message_detail(message_id: string) {
    this.closeMessageNotification();
    if (this.tokenService.user) this.router.navigate(['/user-account/message/inbox/' + message_id]);
  }

  closeSearch() {
    $(".search-page").removeClass("active");
    this.location.back();
  }

  markAsRead(notification_id: string, index: number) {
    this.notificationService.changeNotificationStatus(notification_id, 'READ').subscribe(
      data => {
        this.unread_notifications[index].status = 'READ';
      }, error => {
        console.log(error);
      }
    );
  }

  seeNotification(url1: string, url2: string) {
    url1 = url1 != undefined ? url1 : '';
    url2 = url2 != undefined ? ('/' + url2) : '';
    let url = url1 + url2;
    this.router.navigate([url]);
  }

  getUserChannel() {
    this.userService.getChannelByOwner().subscribe(
      data => {
        if(data.length > 0) this.user_channel = data[0];
      }, error => {
        console.log(error);
      }
    );
  }

  excerpt(text: string){
    return text.length > 50 ? text.substring(0, 50) + "..." : text;
  }

  goToLogin(){
    this.router.navigate(['/login']);
  }

  goToSignup(){
    this.router.navigate(['/sign-up']);
  }
}
