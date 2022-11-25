// done v3

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreSharedModule } from '@/core/shared.module';
import { CoreMainMenuComponentsModule } from '@features/mainmenu/components/components.module';
import { CqComponentsModule } from '../components/cq_components.module';
import { conditionalRoutes } from '@/app/app-routing.module';
import { CoreScreen } from '@services/screen';

import { CqMyCourses } from './cq_my_courses';

const routes: Routes = [
    {
        path: '',
        component: CqMyCourses,
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
        CqMyCourses,
    ],
    exports: [RouterModule],
})
export class CqMyCoursesModule {}