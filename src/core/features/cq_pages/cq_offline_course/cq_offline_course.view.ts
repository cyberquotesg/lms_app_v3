import { Injectable } from '@angular/core';
import { Params } from '@angular/router';

import { CoreContentLinksHandlerBase } from '@features/contentlinks/classes/base-handler';
import { CoreContentLinksAction } from '@features/contentlinks/services/contentlinks-delegate';
import { CoreNavigator } from '@services/navigator';
import { makeSingleton } from '@singletons';

@Injectable({ providedIn: 'root' })
export class CqOfflineCourseViewService extends CoreContentLinksHandlerBase
{
    name = 'CqOfflineCourseViewHandler';
    pattern = /\/cq_offline_course\/view\.php/;

    getActions(siteIds: string[], url: string, params: any): CoreContentLinksAction[] | Promise<CoreContentLinksAction[]>
    {
        return [{
            action: async (siteId, navCtrl?): Promise<void> => {
                const stateParams: any = {};
                await CoreNavigator.navigateToSitePath('/CqOfflineCourse/index', {
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

export const CqOfflineCourseViewHandler = makeSingleton(CqOfflineCourseViewService);
