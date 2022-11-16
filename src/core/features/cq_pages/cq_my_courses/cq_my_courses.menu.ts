import { Injectable } from '@angular/core';
import { makeSingleton } from '@singletons';
import { CoreMainMenuHandler, CoreMainMenuHandlerData } from '@features/mainmenu/services/mainmenu-delegate';

@Injectable({ providedIn: 'root' })
export class CqMyCoursesMenuService implements CoreMainMenuHandler
{
    static readonly PAGE_NAME = 'CqMyCourses';

    name = 'CqMyCoursesMenuHandler';
    priority = 2400;

    getDisplayData(): CoreMainMenuHandlerData
    {
        return {
            icon: 'bookmarks',
            title: 'cq_my_courses',
            page: 'CqMyCourses',
            class: 'cq_my_courses'
        };
    }

    async isEnabled(): Promise<boolean>
    {
        return true;
    }
}

export const CqMyCoursesMenuHandler = makeSingleton(CqMyCoursesMenuService);
