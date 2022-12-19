// done v3

import { APP_INITIALIZER, NgModule, Type } from '@angular/core';
import { Routes } from '@angular/router';

import { CoreMainMenuRoutingModule } from '@features/mainmenu/mainmenu-routing.module';
import { CoreMainMenuTabRoutingModule } from '@features/mainmenu/mainmenu-tab-routing.module';

import { CoreMainMenuDelegate } from '@features/mainmenu/services/mainmenu-delegate';
import { CoreContentLinksDelegate } from '@features/contentlinks/services/contentlinks-delegate';

import { CqDashboardMenuHandler, CqDashboardMenuService } from './cq_dashboard/cq_dashboard.menu';
import { CqDashboardViewHandler } from './cq_dashboard/cq_dashboard.view';

import { CqAvailableCoursesMenuHandler, CqAvailableCoursesMenuService } from './cq_available_courses/cq_available_courses.menu';
import { CqAvailableCoursesViewHandler } from './cq_available_courses/cq_available_courses.view';

import { CqMyCoursesMenuHandler, CqMyCoursesMenuService } from './cq_my_courses/cq_my_courses.menu';
import { CqMyCoursesViewHandler } from './cq_my_courses/cq_my_courses.view';

import { CqMyReportsMenuHandler, CqMyReportsMenuService } from './cq_my_reports/cq_my_reports.menu';
import { CqMyReportsViewHandler } from './cq_my_reports/cq_my_reports.view';

import { CqOfflineCourseMenuHandler, CqOfflineCourseMenuService } from './cq_offline_course/cq_offline_course.menu';
import { CqOfflineCourseViewHandler } from './cq_offline_course/cq_offline_course.view';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: CqDashboardMenuService.PAGE_NAME,
    },
    {
        path: CqDashboardMenuService.PAGE_NAME,
        loadChildren: () => import('./cq_dashboard/cq_dashboard.lazy_module').then(m => m.CqDashboardLazyModule),
    },
    {
        path: CqAvailableCoursesMenuService.PAGE_NAME,
        loadChildren: () => import('./cq_available_courses/cq_available_courses.lazy_module').then(m => m.CqAvailableCoursesLazyModule),
    },
    {
        path: CqMyCoursesMenuService.PAGE_NAME,
        loadChildren: () => import('./cq_my_courses/cq_my_courses.lazy_module').then(m => m.CqMyCoursesLazyModule),
    },
    {
        path: CqMyReportsMenuService.PAGE_NAME,
        loadChildren: () => import('./cq_my_reports/cq_my_reports.lazy_module').then(m => m.CqMyReportsLazyModule),
    },
    {
        path: CqOfflineCourseMenuService.PAGE_NAME,
        loadChildren: () => import('./cq_offline_course/cq_offline_course.lazy_module').then(m => m.CqOfflineCourseLazyModule),
    },
];
@NgModule({
    imports: [
        CoreMainMenuRoutingModule.forChild({ children: routes }),
        CoreMainMenuTabRoutingModule.forChild(routes),
    ],
    exports: [
        CoreMainMenuRoutingModule,
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            multi: true,
            useValue: async () => {
                CoreMainMenuDelegate.registerHandler(CqAvailableCoursesMenuHandler.instance);
                CoreContentLinksDelegate.registerHandler(CqAvailableCoursesViewHandler.instance);

                CoreMainMenuDelegate.registerHandler(CqMyCoursesMenuHandler.instance);
                CoreContentLinksDelegate.registerHandler(CqMyCoursesViewHandler.instance);
                
                CoreMainMenuDelegate.registerHandler(CqDashboardMenuHandler.instance);
                CoreContentLinksDelegate.registerHandler(CqDashboardViewHandler.instance);
                
                CoreMainMenuDelegate.registerHandler(CqMyReportsMenuHandler.instance);
                CoreContentLinksDelegate.registerHandler(CqMyReportsViewHandler.instance);
            },
        },
    ],
})
export class CQPagesModule {}
