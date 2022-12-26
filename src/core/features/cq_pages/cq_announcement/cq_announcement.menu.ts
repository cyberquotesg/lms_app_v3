import { Injectable } from '@angular/core';
import { makeSingleton } from '@singletons';
import { CoreMainMenuHandler, CoreMainMenuHandlerData } from '@features/mainmenu/services/mainmenu-delegate';

@Injectable({ providedIn: 'root' })
export class CqAnnouncementMenuService implements CoreMainMenuHandler
{
    static readonly PAGE_NAME = 'CqAnnouncement';

    name = 'CqAnnouncementMenuHandler';
    priority = 2000;

    getDisplayData(): CoreMainMenuHandlerData
    {
        return {
            icon: 'bar-chart',
            title: 'cq_announcement',
            page: 'CqAnnouncement',
            class: 'cq_announcement'
        };
    }

    async isEnabled(): Promise<boolean>
    {
        return true;
    }
}

export const CqAnnouncementMenuHandler = makeSingleton(CqAnnouncementMenuService);
