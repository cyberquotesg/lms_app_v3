// (C) Copyright 2015 Moodle Pty Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { conditionalRoutes } from '@/app/app-routing.module';
import { Injector, NgModule } from '@angular/core';
import { RouterModule, ROUTES, Routes } from '@angular/router';

import { buildTabMainRoutes } from '@features/mainmenu/mainmenu-tab-routing.module';
import { CoreScreen } from '@services/screen';

import { CqAnnouncementsMenuService } from './cq_announcements.menu';

function buildRoutes(injector: Injector): Routes {
    return [
        {
            path: 'index',
            data: {
                mainMenuTabRoot: CqAnnouncementsMenuService.PAGE_NAME,
            },
            loadChildren: () => import('./cq_announcements.module').then(m => m.CqAnnouncementsModule),
        },
        // ...conditionalRoutes([
        //     {
        //         path: 'list/:id',
        //         loadChildren: () => import('./pages/announcements/announcements.module').then(m => m.AddonAnnouncementsAnnouncementsPageModule),
        //     },
        // ], () => CoreScreen.isMobile),
        ...buildTabMainRoutes(injector, {
            redirectTo: 'index',
            pathMatch: 'full',
        }),
    ];
}

@NgModule({
    exports: [RouterModule],
    providers: [
        {
            provide: ROUTES,
            multi: true,
            deps: [Injector],
            useFactory: buildRoutes,
        },
    ],
})
export class CqAnnouncementsLazyModule {}