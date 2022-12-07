// (C) Copyright 2021 Cyberquote Indonesia

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, SimpleChange, ViewChild} from '@angular/core';
import { CqHelper } from '../../services/cq_helper';
import { CqComponent } from '../../classes/cq_component';

@Component({
    selector: 'cq_filter_modal',
    templateUrl: 'cq_filter_modal.html'
})
export class CqFilterComponentModal extends CqComponent implements OnInit, OnChanges {
    @Input() filterMultipleFinal: any[];
    @Output() onFilterMultipleChange: EventEmitter<any>;

    constructor(CH: CqHelper)
    {
        super(CH);
        this.onFilterMultipleChange = new EventEmitter();
    }

    ngOnInit(): void
    {
    }
    ngOnChanges(changes: SimpleChanges): void
    {
        this.implementChanges(changes);
    }

    filterMultipleChange(identifier: string, value: string, selected?: boolean): void
    {
        /* *a/
        // implement to filterMultipleFinal
        for (let index in this.filterMultipleFinal)
        {
            let filter = this.filterMultipleFinal[index];
            if (filter.identifier != identifier) continue;

            for (let optionIndex in filter.options)
            {
                let option = filter.options[optionIndex];
                if (option.value == value) this.filterMultipleFinal[index].options[optionIndex].selected = selected;
            }
        }
        /* */
    }
    applyFilter(): void
    {
        this.CH.dismissModal({
            apply: true,
            filterMultipleFinal: this.filterMultipleFinal
        });
    }
    dismiss(): void
    {
        this.CH.dismissModal({
            apply: false,
            filterMultipleFinal: {}
        });
    }
}
