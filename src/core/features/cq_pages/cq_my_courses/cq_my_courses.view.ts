import { Injectable } from '@angular/core';
import { Params } from '@angular/router';

import { CoreContentLinksHandlerBase } from '@features/contentlinks/classes/base-handler';
import { CoreContentLinksAction } from '@features/contentlinks/services/contentlinks-delegate';
import { CoreNavigator } from '@services/navigator';
import { makeSingleton } from '@singletons';

@Injectable({ providedIn: 'root' })
export class CqMyCoursesViewService extends CoreContentLinksHandlerBase
{
    name = 'CqMyCoursesViewHandler';
    pattern = /\/cq_my_courses\/view\.php/;

    getActions(siteIds: string[], url: string, params: any): CoreContentLinksAction[] | Promise<CoreContentLinksAction[]>
    {
        return [{
            action: (siteId, navCtrl?): void => {
                const stateParams: any = {};
                CoreNavigator.navigateToSitePath('/CqMyCourses/index', {
                    params: stateParams,
                    siteId,
                    preferCurrentTab: false,
                });
            }
        }];
    }

    async isEnabled(siteId: string, url: string, params: Record<string, string>): Promise<boolean>
    {
        return true;
    }
}

export const CqMyCoursesViewHandler = makeSingleton(CqMyCoursesViewService);
