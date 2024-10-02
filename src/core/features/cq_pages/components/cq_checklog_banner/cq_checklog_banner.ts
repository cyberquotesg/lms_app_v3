// done v3

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, SimpleChange, ViewChild} from '@angular/core';
import { CqHelper } from '../../services/cq_helper';
import { CqComponent } from '../../classes/cq_component';

@Component({
    selector: 'cq_checklog_banner',
    templateUrl: './cq_checklog_banner.html',
})
export class CqChecklogBannerComponent extends CqComponent implements OnInit, OnChanges {
    @Input() code?: string;
    @Input() type?: string;
    @Input() time?: string;
    @Input() name?: string;
    @Input() message?: string;

    timeHI?: string;
    timeA?: string;

    constructor(CH: CqHelper)
    {
        super(CH);
    }
    
    ngOnInit(): void
    {
        let temp = this.time.split(' ');
        this.timeHI = temp[0];
        this.timeA = temp[1];
    }
    ngOnChanges(changes: SimpleChanges): void
    {
        this.implementChanges(changes);
    }

    close(): void
    {
        this.CH.dismissModal();
    }
}
