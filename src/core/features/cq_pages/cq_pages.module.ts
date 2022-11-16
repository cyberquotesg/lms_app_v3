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

const routes: Routes = [
    {
        path: CqDashboardMenuService.PAGE_NAME,
        loadChildren: () => import('./cq_dashboard/cq_dashboard.lazy_module').then(m => m.CqDashboardLazyModule),
    },
    {
        path: CqAvailableCoursesMenuService.PAGE_NAME,
        loadChildren: () => import('./cq_available_courses/cq_available_courses.lazy_module').then(m => m.CqAvailableCoursesLazyModule),
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
                CoreMainMenuDelegate.registerHandler(CqDashboardMenuHandler.instance);
                CoreContentLinksDelegate.registerHandler(CqDashboardViewHandler.instance);

                CoreMainMenuDelegate.registerHandler(CqAvailableCoursesMenuHandler.instance);
                CoreContentLinksDelegate.registerHandler(CqAvailableCoursesViewHandler.instance);
            },
        },
    ],
})
export class CQPagesModule {}
