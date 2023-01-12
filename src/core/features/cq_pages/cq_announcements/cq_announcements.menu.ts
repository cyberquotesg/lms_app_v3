import { Injectable } from '@angular/core';
import { makeSingleton } from '@singletons';
import { CoreMainMenuHandler, CoreMainMenuHandlerData } from '@features/mainmenu/services/mainmenu-delegate';

@Injectable({ providedIn: 'root' })
export class CqAnnouncementsMenuService implements CoreMainMenuHandler
{
    static readonly PAGE_NAME = 'CqAnnouncements';

    name = 'CqAnnouncementsMenuHandler';
    priority = 2000;

    getDisplayData(): CoreMainMenuHandlerData
    {
        return {
            icon: 'megaphone',
            title: 'cq_announcements',
            page: 'CqAnnouncements',
            class: 'cq_announcements'
        };
    }

    async isEnabled(): Promise<boolean>
    {
        return true;
    }
}

export const CqAnnouncementsMenuHandler = makeSingleton(CqAnnouncementsMenuService);
