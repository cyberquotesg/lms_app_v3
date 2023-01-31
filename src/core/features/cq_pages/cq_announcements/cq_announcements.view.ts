import { Injectable } from '@angular/core';
import { Params } from '@angular/router';

import { CoreContentLinksHandlerBase } from '@features/contentlinks/classes/base-handler';
import { CoreContentLinksAction } from '@features/contentlinks/services/contentlinks-delegate';
import { CoreNavigator } from '@services/navigator';
import { makeSingleton } from '@singletons';

@Injectable({ providedIn: 'root' })
export class CqAnnouncementsViewService extends CoreContentLinksHandlerBase
{
    name = 'CqAnnouncementsViewHandler';
    pattern = /\/cq_announcements\/view\.php/;

    getActions(siteIds: string[], url: string, params: any): CoreContentLinksAction[] | Promise<CoreContentLinksAction[]>
    {
        return [{
            action: (siteId, navCtrl?): void => {
                const stateParams: any = {};
                CoreNavigator.navigateToSitePath('/CqAnnouncements/index', {
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

export const CqAnnouncementsViewHandler = makeSingleton(CqAnnouncementsViewService);