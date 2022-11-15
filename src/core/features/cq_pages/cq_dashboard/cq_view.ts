import { Injectable } from '@angular/core';
import { Params } from '@angular/router';

import { CoreContentLinksHandlerBase } from '@features/contentlinks/classes/base-handler';
import { CoreContentLinksAction } from '@features/contentlinks/services/contentlinks-delegate';
import { CoreNavigator } from '@services/navigator';
import { makeSingleton } from '@singletons';

@Injectable({ providedIn: 'root' })
export class CqDashboardViewService extends CoreContentLinksHandlerBase
{
    name = 'CqDashboardViewHandler';
    pattern = /\/cq-dashboard\/view\.php/;

    getActions(siteIds: string[], url: string, params: any): CoreContentLinksAction[] | Promise<CoreContentLinksAction[]>
    {
        return [{
            action: (siteId, navCtrl?): void => {
                const stateParams: any = {};
                // this.linkHelper.goInSite(navCtrl, 'CqDashboardPage', stateParams, siteId);

                CoreNavigator.navigateToSitePath('/calendar/index', {
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

export const CqDashboardViewHandler = makeSingleton(CqDashboardViewService);
