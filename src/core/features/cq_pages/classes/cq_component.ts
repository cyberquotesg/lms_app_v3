// done v3

import { CqGeneral } from './cq_general';
import { CqHelper } from '../services/cq_helper';
import { CoreNavigationOptions, CoreNavigator } from '@services/navigator';

export class CqComponent extends CqGeneral
{
    constructor(CH: CqHelper)
    {
        super(CH);
    }

    implementChanges(changes: any): void
    {
        this.CH.log("implementing changes", changes);
        
        for (let varName in changes)
        {
            if (typeof changes[varName] != 'undefined')
            {
                this[varName] = changes[varName].currentValue;
            }
        }
    }

    goToNotificationsList(): void
    {
        // CoreNavigator.navigateToSitePath(`notifications/list`, {});
        
        const stateParams: any = {
        };
        CoreNavigator.navigateToSitePath('/cq-notifications/list', {
            params: stateParams,
            siteId: this.CH.getSiteId(),
            preferCurrentTab: false,
        });
    }
}
