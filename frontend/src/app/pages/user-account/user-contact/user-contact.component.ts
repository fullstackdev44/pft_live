import { Component, OnInit, Renderer2, HostListener } from '@angular/core';

import { CommonComponent } from '../../shared/mock/component';

import { UserService } from '../../shared/services/user.service';
import { TokenService } from '../../shared/authentication/token.service';

import { User } from '../../shared/models/user';
import { ChannelService } from '../../shared/services/channel.service';

declare var $: any;

@Component({
  selector: 'pft-user-contact',
  templateUrl: './user-contact.component.html'
})
export class UserContactComponent extends CommonComponent implements OnInit {

	private user: User = new User();
  public user_contacts: any[] = [];
  private all_users: User[] = [];

  // contact manager view
  public all_contacts: any[] = [];
  public new_contacts: any[] = [];
  public index: number;
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
  	if(this.tokenService.user){
  		/*this.initData(this.user, this.userService.queryUser(this.tokenService.user._id, ['contacts'], ['contacts']), () => {
  			this.user_contacts = this.user.contacts.map(current => {return {id: current._id, text: current.full_name}});
      });*/
      this.initData(this.user, this.userService.getUserDetailPopulate(this.tokenService.user._id), () => {
        this.user_contacts = this.user.contacts.slice(0);
        this.initData(this.all_users, this.userService.getAllUsers(), () => {
          this.all_users = this.all_users.filter(current => current._id != this.user._id);
          this.user.blocked_users.map(current_blocked_user => {
            this.all_users.map((current_user, index) => {
              if (current_blocked_user.user._id == current_user._id) {
                this.all_users.splice(index, 1);
              }
            });
          });
          this.all_contacts = this.all_users.map(current => {
            return {
                id: current._id,
                text: current.full_name ? current.full_name : ''
            };
          });
        });
      });
  	}
  }

  update_contact() {
    this.initData(null, this.userService.updateUser(this.user, ["contacts"]), () => {
      this.user_contacts = this.user.contacts.slice(0);
      this.new_contacts = [];
    });
  }

  selected(event: any) {
    const contact_index = this.all_contacts.map(current => current.id).indexOf(event.id);
    this.user.contacts.push(this.all_users[contact_index]);
  }

  removed(event: any) {
    const contact_index = this.user.contacts.map(current => current._id).indexOf(event.id);
    this.user.contacts.splice(contact_index, 1);
  }

  removeUserContactList() {
    this.loading = true;
    this.user.contacts.splice(this.index, 1);
    this.userService.updateUser(this.user, ["contacts"]).subscribe(
      data => {
        this.loading = false;
        let user_id = this.user_contacts[this.index]._id;
        this.user_contacts.splice(this.index, 1);
        this.index = undefined;
        this.hideConfirmationModal();
        this.unsubscribeFromChannel(user_id);
      }, error => {
        console.log(error);
      }
    );
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
