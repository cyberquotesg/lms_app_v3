// done v3

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreSharedModule } from '@/core/shared.module';
import { CoreMainMenuComponentsModule } from '@features/mainmenu/components/components.module';
import { CqComponentsModule } from '../components/cq_components.module';
import { conditionalRoutes } from '@/app/app-routing.module';
import { CoreScreen } from '@services/screen';

import { CqDashboard } from './cq_dashboard';

const routes: Routes = [
    {
        path: '',
        component: CqDashboard,
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
        CoreMainMenuComponentsModule,
        CqComponentsModule,
    ],
    declarations: [
        CqDashboard,
    ],
    exports: [RouterModule],
})
export class CqDashboardModule {}
