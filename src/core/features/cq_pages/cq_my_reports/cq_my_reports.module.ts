// done v3

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreSharedModule } from '@/core/shared.module';
// import { CoreMainMenuUserMenuComponent } from '@/core/features/mainmenu/components/user-menu/user-menu';
// import { CoreMainMenuUserButtonComponent } from '@features/mainmenu/components/user-menu-button/user-menu-button';
// import { CoreMainMenuUserMenuTourComponent } from '@features/mainmenu/components/user-menu-tour/user-menu-tour';
import { CqComponentsModule } from '../components/cq_components.module';
import { conditionalRoutes } from '@/app/app-routing.module';
import { CoreScreen } from '@services/screen';

import { CqMyReports } from './cq_my_reports';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

const routes: Routes = [
    {
        path: '',
        component: CqMyReports,
        // children: conditionalRoutes([
        //     {
        //         path: ':id',
        //         loadChildren: () => import('../../pages/notification/notification.module')
        //             .then(m => m.AddonNotificationsNotificationPageModule),
        //     },
        // ], () => CoreScreen.isTablet),
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CoreSharedModule,
        // CoreMainMenuUserMenuComponent,
        // CoreMainMenuUserButtonComponent,
        // CoreMainMenuUserMenuTourComponent,
        CqComponentsModule,
    ],
    declarations: [
        CqMyReports,
    ],
    exports: [RouterModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CqMyReportsModule {}
