// (C) Copyright 2021 Cyberquote Indonesia

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { CqHelper } from '../../services/cq_helper';
import { CqComponent } from '../../classes/cq_component';

@Component({
    selector: 'cq_empty',
    templateUrl: 'cq_empty.html'
})
export class CqEmptyComponent extends CqComponent implements OnInit, OnChanges {
    @Input() empty: boolean;
    @Output() onChange: EventEmitter<any>;
    
    constructor(CH: CqHelper)
    {
        super(CH);

        this.onChange = new EventEmitter();
    }

    ngOnInit(): void
    {
    }
    ngOnChanges(changes: SimpleChanges): void
    {
        this.implementChanges(changes);
    }
}
