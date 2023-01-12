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

import { AddonCalendarMainMenuHandler, AddonCalendarMainMenuHandlerService } from './cq_calendar/services/handlers/mainmenu';
import { AddonCalendarViewLinkHandler } from './cq_calendar/services/handlers/view-link';

import { CqAnnouncementsMenuHandler, CqAnnouncementsMenuService } from './cq_announcements/cq_announcements.menu';
import { CqAnnouncementsViewHandler } from './cq_announcements/cq_announcements.view';

import { CqAnnouncementMenuHandler, CqAnnouncementMenuService } from './cq_announcement/cq_announcement.menu';
import { CqAnnouncementViewHandler } from './cq_announcement/cq_announcement.view';

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
    {
        path: AddonCalendarMainMenuHandlerService.PAGE_NAME,
        loadChildren: () => import('./cq_calendar/calendar-lazy.module').then(m => m.AddonCalendarLazyModule),
    },
    {
        path: CqAnnouncementsMenuService.PAGE_NAME,
        loadChildren: () => import('./cq_announcements/cq_announcements.lazy_module').then(m => m.CqAnnouncementsLazyModule),
    },
    {
        path: CqAnnouncementMenuService.PAGE_NAME,
        loadChildren: () => import('./cq_announcement/cq_announcement.lazy_module').then(m => m.CqAnnouncementLazyModule),
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
                
                // CoreMainMenuDelegate.registerHandler(CqOfflineCourseMenuHandler.instance);
                // CoreContentLinksDelegate.registerHandler(CqOfflineCourseViewHandler.instance);
                
                CoreMainMenuDelegate.registerHandler(AddonCalendarMainMenuHandler.instance);
                CoreContentLinksDelegate.registerHandler(AddonCalendarViewLinkHandler.instance);
                
                CoreMainMenuDelegate.registerHandler(CqAnnouncementsMenuHandler.instance);
                CoreContentLinksDelegate.registerHandler(CqAnnouncementsViewHandler.instance);
                
                CoreMainMenuDelegate.registerHandler(CqAnnouncementMenuHandler.instance);
                CoreContentLinksDelegate.registerHandler(CqAnnouncementViewHandler.instance);
            },
        },
    ],
})
export class CQPagesModule {}
