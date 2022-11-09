// done v3

import { APP_INITIALIZER, NgModule, Type } from '@angular/core';

import { Routes } from '@angular/router';
import { CoreMainMenuRoutingModule } from '@features/mainmenu/mainmenu-routing.module';
import { CoreMainMenuTabRoutingModule } from '@features/mainmenu/mainmenu-tab-routing.module';
import { CoreMainMenuDelegate } from '@features/mainmenu/services/mainmenu-delegate';
import { CoreContentLinksDelegate } from '@features/contentlinks/services/contentlinks-delegate';

import { CqDashboardMenuHandler, CqDashboardMenuHandlerService } from './services/handlers/mainmenu';
import { CqDashboardViewHandler } from './services/handlers/view-link';

@NgModule({
    imports: [
    ],
    exports: [
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            multi: true,
            useValue: async () => {
                CoreMainMenuDelegate.registerHandler(CqDashboardMenuHandler.instance);
                CoreContentLinksDelegate.registerHandler(CqDashboardViewHandler.instance);
            },
        },
    ],
})
export class CqDashboardModule {}
