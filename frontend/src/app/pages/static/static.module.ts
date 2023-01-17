import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StaticRoutingModule } from './static-routing.module';
import { StaticComponent } from './static.component';
import { AboutComponent } from './about/about.component';
import { CommunityRulesComponent } from './community-rules/community-rules.component';
import { PrivacyChoicesComponent } from './privacy-choices/privacy-choices.component';
import { CaliforniaPrivacyDisclosureComponent } from './california-privacy-disclosure/california-privacy-disclosure.component';
import { PrivacyNoticeComponent } from './privacy-notice/privacy-notice.component';
import { TermsOfSaleComponent } from './terms-of-sale/terms-of-sale.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { BlogsComponent } from './blogs/blogs.component';
import { ContractsComponent } from './contracts/contracts.component';
import { DonateComponent } from './donate/donate.component';
import { FaqComponent } from './faq/faq.component';
import { DmcaComponent } from './dmca/dmca.component';
import { MusicComponent } from './music/music.component';
import { VodComponent } from './vod/vod.component';
import { AffiliateAgreementComponent } from './affiliate-agreement/affiliate-agreement.component';
import { AffiliateProgramPayoutComponent } from './affiliate-program-payout/affiliate-program-payout.component';
import { CookiePolicyComponent } from './cookie-policy/cookie-policy.component';
import { AccountSuspensionComponent } from './account-suspension/account-suspension.component';
import { ConductHarassementComponent } from './conduct-harassement/conduct-harassement.component';
import { NudityPornographyComponent } from './nudity-pornography/nudity-pornography.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    StaticComponent,
    AboutComponent,
    CommunityRulesComponent,
    PrivacyChoicesComponent,
    CaliforniaPrivacyDisclosureComponent,
    PrivacyNoticeComponent,
    TermsOfSaleComponent,
    TermsOfServiceComponent,
    BlogsComponent,
    ContractsComponent,
    DonateComponent,
    FaqComponent,
    DmcaComponent,
    MusicComponent,
    CookiePolicyComponent,
    ConductHarassementComponent,
    NudityPornographyComponent,
    AccountSuspensionComponent,
    VodComponent,
    AffiliateAgreementComponent,
    AffiliateProgramPayoutComponent,
  ],
  imports: [
    CommonModule,
    StaticRoutingModule,
    FormsModule
  ]
})
export class StaticModule { }
