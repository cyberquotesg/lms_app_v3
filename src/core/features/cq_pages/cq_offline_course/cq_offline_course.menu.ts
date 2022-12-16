import { Injectable } from '@angular/core';
import { makeSingleton } from '@singletons';
import { CoreMainMenuHandler, CoreMainMenuHandlerData } from '@features/mainmenu/services/mainmenu-delegate';

@Injectable({ providedIn: 'root' })
export class CqOfflineCourseMenuService implements CoreMainMenuHandler
{
    static readonly PAGE_NAME = 'CqOfflineCourse';

    name = 'CqOfflineCourseMenuHandler';
    priority = 2200;

    getDisplayData(): CoreMainMenuHandlerData
    {
        return {
            icon: 'bar-chart',
            title: 'cq_offline_course',
            page: 'CqOfflineCourse',
            class: 'cq_offline_course'
        };
    }

    async isEnabled(): Promise<boolean>
    {
        return false;
    }
}

export const CqOfflineCourseMenuHandler = makeSingleton(CqOfflineCourseMenuService);
