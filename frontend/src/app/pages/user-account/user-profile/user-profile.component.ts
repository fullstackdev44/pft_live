import { Component, OnInit } from '@angular/core';

import { CommonComponent } from '../../shared/mock/component';

import { UserService } from '../../shared/services/user.service';
import { TokenService } from '../../shared/authentication/token.service';

import { User } from '../../shared/models/user';

@Component({
  selector: 'pft-user-profile',
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent extends CommonComponent implements OnInit {

  public user: User = new User();
  public country_list = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua &amp; Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas"
  ,"Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia &amp; Herzegovina","Botswana","Brazil","British Virgin Islands"
  ,"Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica"
  ,"Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea"
  ,"Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana"
  ,"Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India"
  ,"Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia"
  ,"Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania"
  ,"Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia"
  ,"New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal"
  ,"Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre &amp; Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles"
  ,"Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts &amp; Nevis","St Lucia","St Vincent","St. Lucia","Sudan"
  ,"Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad &amp; Tobago","Tunisia"
  ,"Turkey","Turkmenistan","Turks &amp; Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","United States Minor Outlying Islands","Uruguay"
  ,"Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];
  public profile_updated: boolean = undefined;
  public dob: Date = new Date();

  constructor(private userService: UserService,
    private tokenService: TokenService) {
    super();
  }

  ngOnInit() {
    this.tokenService.decodeUserToken();
    this.initData(this.user, this.userService.getUserDetail(this.tokenService.user._id), () => {
      // this.user.dob = new Date(this.user.dob);
      this.dob = new Date(this.user.dob);
    });
  }

  update_profile() {
    this.user.avatar = this.user.avatar;
    this.user.phone_number = this.user.phone_number;
    this.user.email = this.user.email;
    this.user.country = this.user.country;
    this.user.gender = this.user.gender;
    this.user.account_type = this.user.account_type;
    // this.user.dob = this.user.dob;
    this.user.dob = this.dob;

    this.update_user(["avatar", "phone_number", "email", "country", "gender", "account_type", "dob"]);
  }

  filePrepare(event) {
    const logo_image_file = event.target.files[0];
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(logo_image_file);
    reader.onload = (e) => {
      this.user.avatar = reader.result as string;
    };
  }

  update_user(fields: Array<string> = []) {
    this.profile_updated = undefined;
    if (this.user.dob instanceof Date) {
    } else {
      this.user.dob = new Date(this.user.dob);
    }

    this.initData(null, this.userService.updateUser(this.user, fields), () => {
      this.profile_updated = true;
    });
  }
}
