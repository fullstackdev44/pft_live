import { Component, OnInit, Renderer2, HostListener } from '@angular/core';

import { CommonComponent } from '../../shared/mock/component';

import { TokenService } from '../../shared/authentication/token.service'
import { UserService } from '../../shared/services/user.service';

import { User } from '../../shared/models/user';
import { ChannelService } from '../../shared/services/channel.service';

declare var $: any;

@Component({
  selector: 'pft-user-blocked',
  templateUrl: './user-blocked.component.html'
})
export class UserBlockedComponent extends CommonComponent implements OnInit {

  public user: User = new User();
  public contacts: any[] = [];
  public index: number;
  public blocked_users: any[] = [];
  public new_blocked_users: any[] = [];
  public loading: boolean = false;

  constructor(
    private tokenService: TokenService,
    private userService: UserService,
    private renderer: Renderer2,
    private channelService: ChannelService
  ) {
  	super();
  }

  ngOnInit() {

  	this.tokenService.decodeUserToken();
  	if(this.tokenService.user && this.tokenService.user._id){
      // this.initData(this.user, this.userService.queryUser(this.tokenService.user._id, ['blocked_users'], ['blocked_users']));
      this.initData(this.user, this.userService.getUserDetailPopulate(this.tokenService.user._id), () => {
        this.blocked_users = this.user.blocked_users.slice(0);
        this.contacts = this.user.contacts.map(current => {
          return {
              id: current._id,
              text: current.full_name ? current.full_name : ''
          };
        });
      });
  	}
  }

  update_blocked_users() {
    this.user.blocked_users.forEach(current_blocked_user => {
      this.user.contacts.forEach((current_contact, index) => {
        if (current_blocked_user.user._id == current_contact._id) {
          this.user.contacts.splice(index, 1);
        }
      });
    });

    this.initData(null, this.userService.updateUser(this.user, ["blocked_users", "contacts"]), () => {
      this.blocked_users = this.user.blocked_users.slice(0);
      this.new_blocked_users = [];
    });

    this.new_blocked_users.map(current => {
      this.unsubscribeFromChannel(current.id);
    });
  }

  unsubscribeFromChannel(user_id: string){
    this.channelService.checkChannelOfUser(user_id).subscribe(
      data => {
        this.initData(null, this.userService.unsubscribe(data));
      }, error => {
        console.log(error);
      }
    );
	}

  selected(event: any) {
    const contact_index = this.contacts.map(current => current.id).indexOf(event.id);
    this.user.blocked_users.push({user: this.user.contacts[contact_index], date: new Date()});
  }

  removed(event: any) {
    const contact_index = this.user.blocked_users.map(current => current._id).indexOf(event.id);
    this.user.blocked_users.splice(contact_index, 1);
  }

  removeUserFromBlockedList() {
    this.loading = true;
    this.user.blocked_users.splice(this.index, 1);
    this.userService.updateUser(this.user, ["blocked_users"]).subscribe(
      data => {
        this.loading = false;
        this.blocked_users.splice(this.index, 1);
        this.index = undefined;
        this.hideConfirmationModal();
      }, error => {
        console.log(error);
      }
    );
  }

  showConfirmationModal(index: number) {
    if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');}
    $(".signup_form").removeClass("show");
    $(".form_popup").addClass("opened");
    $(".login_form").addClass("show");
    this.index = index;
  }

  hideConfirmationModal(){
    this.renderer.removeClass(document.body, 'overlay');
    $(".form_popup").removeClass("opened");
    $(".signup_form").removeClass("show");
    $(".login_form").removeClass("show");
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if($('.form_popup.opened').length > 0 || $('.login_form.show').length > 0) {
      if (window.innerWidth > 577) {this.renderer.addClass(document.body, 'overlay');
      } else { this.renderer.removeClass(document.body, 'overlay'); }
    }
  }
}
