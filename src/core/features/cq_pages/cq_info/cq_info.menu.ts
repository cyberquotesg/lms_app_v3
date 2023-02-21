import { Injectable } from '@angular/core';
import { makeSingleton } from '@singletons';
import { CoreMainMenuHandler, CoreMainMenuHandlerData } from '@features/mainmenu/services/mainmenu-delegate';

@Injectable({ providedIn: 'root' })
export class CqInfoMenuService implements CoreMainMenuHandler
{
    static readonly PAGE_NAME = 'CqInfo';

    name = 'CqInfoMenuHandler';
    priority = 2000;

    getDisplayData(): CoreMainMenuHandlerData
    {
        return {
            icon: 'megaphone',
            title: 'cq_info',
            page: 'CqInfo',
            class: 'cq_info'
        };
    }

    async isEnabled(): Promise<boolean>
    {
        return true;
    }
}

export const CqInfoMenuHandler = makeSingleton(CqInfoMenuService);
