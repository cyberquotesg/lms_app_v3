import { Injectable } from '@angular/core';
import { makeSingleton } from '@singletons';
import { CoreMainMenuHandler, CoreMainMenuHandlerData } from '@features/mainmenu/services/mainmenu-delegate';

@Injectable({ providedIn: 'root' })
export class CqDashboardMenuHandlerService implements CoreMainMenuHandler
{
    static readonly PAGE_NAME = 'CqDashboard';

    name = 'CqDashboardMenuHandler';
    priority = 2000;

    getDisplayData(): CoreMainMenuHandlerData
    {
        return {
            icon: 'star',
            title: 'cq-dashboard',
            page: 'CqDashboard',
            class: 'cq-dashboard'
        };
    }

    async isEnabled(): Promise<boolean>
    {
        return true;
    }
}

export const CqDashboardMenuHandler = makeSingleton(CqDashboardMenuHandlerService);
