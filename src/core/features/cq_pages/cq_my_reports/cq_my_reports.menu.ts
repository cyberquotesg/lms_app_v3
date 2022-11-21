import { Injectable } from '@angular/core';
import { makeSingleton } from '@singletons';
import { CoreMainMenuHandler, CoreMainMenuHandlerData } from '@features/mainmenu/services/mainmenu-delegate';

@Injectable({ providedIn: 'root' })
export class CqMyReportsMenuService implements CoreMainMenuHandler
{
    static readonly PAGE_NAME = 'CqMyReports';

    name = 'CqMyReportsMenuHandler';
    priority = 2200;

    getDisplayData(): CoreMainMenuHandlerData
    {
        return {
            icon: 'bar-chart',
            title: 'cq_my_reports',
            page: 'CqMyReports',
            class: 'cq_my_reports'
        };
    }

    async isEnabled(): Promise<boolean>
    {
        return true;
    }
}

export const CqMyReportsMenuHandler = makeSingleton(CqMyReportsMenuService);
