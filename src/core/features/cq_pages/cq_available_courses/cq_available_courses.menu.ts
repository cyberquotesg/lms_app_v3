import { Injectable } from '@angular/core';
import { makeSingleton } from '@singletons';
import { CoreMainMenuHandler, CoreMainMenuHandlerData } from '@features/mainmenu/services/mainmenu-delegate';

@Injectable({ providedIn: 'root' })
export class CqAvailableCoursesMenuService implements CoreMainMenuHandler
{
    static readonly PAGE_NAME = 'CqAvailableCourses';

    name = 'CqAvailableCoursesMenuHandler';
    priority = 2400;

    getDisplayData(): CoreMainMenuHandlerData
    {
        return {
            icon: 'book',
            title: 'cq_available_courses',
            page: 'CqAvailableCourses',
            class: 'cq_available_courses'
        };
    }

    async isEnabled(): Promise<boolean>
    {
        return true;
    }
}

export const CqAvailableCoursesMenuHandler = makeSingleton(CqAvailableCoursesMenuService);
