// (C) Copyright 2021 Cyberquote Indonesia
/*
filterMultiple: [
    {
        identifier: 'type',
        fieldsToCheck: 'type',
        options: [
            {
                title: 'Compulsory',
                value: 'compulsory',
                selected: true,
            },
            {
                title: 'Supplementary',
                value: 'supplementary',
                selected: false,
            },
        ],

        // if true, system make sure that options has additional option with empty value
        // default is false or not set (optional)
        includeEmptyOption: false,
    },
]
*/

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, SimpleChange, ViewChild} from '@angular/core';
import { CqHelper } from '../../services/cq_helper';
import { CqComponent } from '../../classes/cq_component';
import { CqFilterComponentModal } from './cq_filter_modal';

@Component({
    selector: 'cq_filter',
    templateUrl: 'cq_filter.html'
})
export class CqFilterComponent extends CqComponent implements OnInit, OnChanges {
    @Input() placeholder?: string;
    @Input() filterMultiple?: any[];
    @Input() filterMultipleTitle?: string;
    @Input() includeEmptyOptionForAll?: boolean;
    @Output() onFilterChange: EventEmitter<any>;

    private filterText = '';
    private filterMultipleInternal: any[] = [];
    private hasFilterMultiple: boolean = false;
    private openingFilterMultiple: boolean = false;

    constructor(CH: CqHelper)
    {
        super(CH);
        this.onFilterChange = new EventEmitter();

        if (!this.placeholder) this.placeholder = 'Search';
    }

    ngOnInit(): void
    {
        this.hasFilterMultiple = !this.CH.isEmpty(this.filterMultiple);
        if (this.hasFilterMultiple) this.filterMultipleInternal = this.getFilterMultipleInternal(this.filterMultiple);
    }
    ngOnChanges(changes: SimpleChanges): void
    {
        this.implementChanges(changes);

        this.hasFilterMultiple = !this.CH.isEmpty(this.filterMultiple);
        if (this.hasFilterMultiple) this.filterMultipleInternal = this.getFilterMultipleInternal(this.filterMultiple);
    }

    getFilterMultipleInternal(filterMultiple: any[] | undefined): any[]
    {
        if (typeof filterMultiple == "undefined") return [];
        else
        {
            let filterMultipleInternal: any[] = [];
            filterMultiple.forEach((filter) => {
                if (filter.includeEmptyOption || this.includeEmptyOptionForAll) 
                {
                    if (!this.CH.isItemFoundByCriteria(filter.options, "value", -1))
                    {
                        filter.options.splice(0, 0, {
                            title: 'Not Set',
                            value: -1,
                            selected: true,
                        });
                    }
                }

                filterMultipleInternal.push(filter);
            });

            return filterMultipleInternal;
        }
    }

    filterTextChange(text: string): void
    {
        this.filterText = text.trim();
        this.emitFilter();
    }
    openFilterMultiple(): void
    {
        this.openingFilterMultiple = true;
        this.CH.modal(CqFilterComponentModal, {
            filterMultipleTitle: this.filterMultipleTitle,
            filterMultiple: this.filterMultipleInternal
        }, (data) => {
            this.openingFilterMultiple = false;
            if (data.apply)
            {
                this.filterMultipleInternal = this.CH.cloneJson(data.filterMultiple);
                this.emitFilter();
            }
        });
    }
    emitFilter(): void
    {
        let emitData: any = {
            text: this.filterText,
            filterMultiple: this.filterMultipleInternal,
        };
        this.CH.log('emit data', emitData);
        this.onFilterChange.emit(emitData);
    }
}
