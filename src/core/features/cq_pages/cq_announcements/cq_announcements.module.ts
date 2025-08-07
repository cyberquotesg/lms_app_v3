// done v3

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreSharedModule } from '@/core/shared.module';
import { CoreMainMenuUserMenuComponent } from '@/core/features/mainmenu/components/user-menu/user-menu';
import { CoreMainMenuUserButtonComponent } from '@features/mainmenu/components/user-menu-button/user-menu-button';
import { CoreMainMenuUserMenuTourComponent } from '@features/mainmenu/components/user-menu-tour/user-menu-tour';
import { CqComponentsModule } from '../components/cq_components.module';
import { conditionalRoutes } from '@/app/app-routing.module';
import { CoreScreen } from '@services/screen';
import { CqAnnouncements } from './cq_announcements';

const routes: Routes = [
    {
        path: '',
        component: CqAnnouncements,
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CoreSharedModule,
        CoreMainMenuUserMenuComponent,
        CoreMainMenuUserButtonComponent,
        CoreMainMenuUserMenuTourComponent,
        CqComponentsModule,
    ],
    declarations: [
        CqAnnouncements,
    ],
    exports: [RouterModule],
})
export class CqAnnouncementsModule {}
