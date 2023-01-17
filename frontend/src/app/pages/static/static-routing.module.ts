import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaticComponent } from './static.component';
import { AboutComponent } from './about/about.component';
import { BlogsComponent } from './blogs/blogs.component';
import { CommunityRulesComponent } from './community-rules/community-rules.component';
import { ContractsComponent } from './contracts/contracts.component';
import { DonateComponent } from './donate/donate.component';
import { FaqComponent } from './faq/faq.component';
import { MusicComponent } from './music/music.component';
import { DmcaComponent } from './dmca/dmca.component';
import { CookiePolicyComponent } from './cookie-policy/cookie-policy.component';
import { AccountSuspensionComponent } from './account-suspension/account-suspension.component';
import { NudityPornographyComponent } from './nudity-pornography/nudity-pornography.component';
import { CaliforniaPrivacyDisclosureComponent } from './california-privacy-disclosure/california-privacy-disclosure.component';
import { PrivacyNoticeComponent } from './privacy-notice/privacy-notice.component';
import { PrivacyChoicesComponent } from './privacy-choices/privacy-choices.component';
import { TermsOfSaleComponent } from './terms-of-sale/terms-of-sale.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { ConductHarassementComponent } from './conduct-harassement/conduct-harassement.component';
import { VodComponent } from './vod/vod.component';
import { AffiliateAgreementComponent } from './affiliate-agreement/affiliate-agreement.component';
import { AffiliateProgramPayoutComponent } from './affiliate-program-payout/affiliate-program-payout.component';

const routes: Routes = [
  { path: '', component: StaticComponent, children: [
    {path: 'about', component: AboutComponent},
    {path: 'blogs', component: BlogsComponent},
    {path: 'community_rules', component: CommunityRulesComponent},
    {path: 'contracts', component: ContractsComponent},
    {path: 'donate', component: DonateComponent},
    {path: 'faq', component: FaqComponent},
    {path: 'nudity_pornography_sexual_content', component: NudityPornographyComponent},
    {path: 'california_privacy_disclosure', component: CaliforniaPrivacyDisclosureComponent},
    {path: 'privacy_notice', component: PrivacyNoticeComponent},
    {path: 'privacy_choices', component: PrivacyChoicesComponent},
    {path: 'terms_of_sale', component: TermsOfSaleComponent},
    {path: 'terms_of_service', component: TermsOfServiceComponent},
    {path: 'hateful_conduct_and_harassement', component: ConductHarassementComponent},
    {path: 'account_suspension_and_warning', component: AccountSuspensionComponent},
    {path: 'dmca_guidelines', component: DmcaComponent},
    {path: 'cookie_policy', component: CookiePolicyComponent},
    {path: 'music_guidelines', component: MusicComponent},
    {path: 'vod', component: VodComponent},
    {path: 'affiliate_agreement', component: AffiliateAgreementComponent},
    {path: 'affiliate_program_payout', component: AffiliateProgramPayoutComponent}
  ] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaticRoutingModule { }
