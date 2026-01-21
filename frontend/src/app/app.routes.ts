import { Routes } from '@angular/router';
import { IntroComponent } from './intro/intro.component';
import { DevelopersComponent } from './developers/developers.component';
import { CommunityComponent } from './community/community.component';
import { MediakitComponent } from './mediakit/mediakit.component';
// import { TermsComponent } from './terms of use/terms.component';
// import { PolicyComponent } from './privacy policy/policy.component';
import { HowComponent } from './how it works/how.component';

export const routes: Routes = [
  { path: '', component: IntroComponent, title: 'Home | Delora' },
  { path: 'developers', component: DevelopersComponent, title: 'Developers | Delora' },
  { path: 'community', component: CommunityComponent, title: 'Community | Delora' },
	{ path: 'mediakit', component: MediakitComponent, title: 'Media Kit | Delora' },
	// { path: 'terms', component: TermsComponent, title: 'Terms of Use | Delora' },
	// { path: 'policy', component: PolicyComponent, title: 'Privacy Policy | Delora' },
	{ path: 'execution', component: HowComponent, title: 'How it works | Delora' },
  { path: '**', redirectTo: '' }
];
