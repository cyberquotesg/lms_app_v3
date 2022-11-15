// done v3

import { CqGeneral } from './cq_general';
import { CqHelper } from '../services/cq_helper';

export class CqComponent extends CqGeneral
{
    constructor(CH: CqHelper)
    {
        super(CH);
    }

    implementChanges(changes: any): void
    {
        for (let varName in changes)
        {
            if (typeof changes[varName] != 'undefined')
            {
                this[varName] = changes[varName].currentValue;
            }
        }
    }
}
