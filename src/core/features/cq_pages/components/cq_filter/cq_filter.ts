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
    @Input() includeEmptyOptionForAll?: boolean;
    @Output() onFilterChange: EventEmitter<any>;

    private filterText = '';
    private filterMultipleFinal: any[] = [];
    private openFilterMultiple = false;
    private hasFilterMultiple: boolean = false;

    constructor(CH: CqHelper)
    {
        super(CH);
        this.onFilterChange = new EventEmitter();

        if (!this.placeholder) this.placeholder = 'Search';
    }

    ngOnInit(): void
    {
        this.hasFilterMultiple = !this.CH.isEmpty(this.filterMultiple);
        if (this.hasFilterMultiple) this.filterMultipleFinal = this.getFilterMultipleFinal(this.filterMultiple);
    }
    ngOnChanges(changes: SimpleChanges): void
    {
        this.implementChanges(changes);

        this.hasFilterMultiple = !this.CH.isEmpty(this.filterMultiple);
        if (this.hasFilterMultiple) this.filterMultipleFinal = this.getFilterMultipleFinal(this.filterMultiple);
    }

    getFilterMultipleFinal(filterMultiple: any[] | undefined): any[]
    {
        if (typeof filterMultiple == "undefined") return [];
        else
        {
            let filterMultipleFinal: any[] = [];
            filterMultiple.forEach((filter) => {
                var includeEmptyOption = false;

                if (typeof filter.includeEmptyOption != 'undefined')
                {
                    includeEmptyOption = filter.includeEmptyOption;
                }
                else if (typeof this.includeEmptyOptionForAll != 'undefined')
                {
                    includeEmptyOption = this.includeEmptyOptionForAll;
                }

                if (includeEmptyOption)
                {
                    // let title = 'No ' + this.toTitle(filter.identifier);
                    let title = 'Not Set';

                    filter.options.push({
                        title: title,
                        value: undefined,
                        selected: true,
                    });
                }

                filterMultipleFinal.push(filter);
            });

            return filterMultipleFinal;
        }
    }

    toggleOpenFilterMultiple(): void
    {
        this.CH.modal(CqFilterComponentModal, {filterMultipleFinal: this.filterMultipleFinal}, (data) => {
            console.log("closed", data);
            this.filterMultipleFinal = data.filterMultipleFinal;
        });
    }

    filterTextChange(value: string): void
    {
        this.onFilterChange.emit({
            text: value.trim(),
        });
    }
    filterMultipleChange(identifier: string, value: string, selected?: boolean): void
    {
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
        this.onFilterChange.emit();
    }











    /* *a/
    getFilteredData(items: any): any[]
    {
        const showLog = false;
        items = this.CH.toArray(items);

        if (!this.CH.isEmpty(this.filterText))
        {
            items = this.CH.getFiltered(items, this.filterText);
        }

        /* *a/
        if (!this.CH.isEmpty(this.filterMultipleFinal))
        {
            if (showLog) this.CH.log('getFilteredData - start getFilteredData');
            for (let index in this.filterMultipleFinal)
            {
                let filter = this.filterMultipleFinal[index];
                let fieldsToCheck = this.CH.toArray(filter.fieldsToCheck);

                // compile true options first
                let trueOptions: any[] = [];
                for (let index in filter.options)
                {
                    if (filter.options[index].selected) trueOptions.push(filter.options[index].value);
                }

                if (showLog)
                {
                    this.CH.log('getFilteredData - checking this filter:', filter);
                    this.CH.log('getFilteredData - trueOptions for this filter:', trueOptions);
                }

                let newItems: any[] = [];
                for (let index in items)
                {
                    let item = items[index];
                    if (showLog) this.CH.log('> getFilteredData - checking this item:', item);

                    fieldsToCheck.forEach((fieldToCheck) => {
                        if (showLog) this.CH.log('>> getFilteredData - checking this field:', fieldToCheck);

                        if (typeof item[fieldToCheck] == 'undefined')
                        {
                            if (showLog) this.CH.log('>> getFilteredData - fieldToCheck is not found on item');
                            return;
                        }
                        else
                        {
                            if (showLog) this.CH.log('>> getFilteredData - fieldToCheck is found');

                            trueOptions.forEach((trueOption) => {
                                if (showLog) this.CH.log('>>> getFilteredData - checking this option:', trueOption);

                                if (typeof trueOption == 'undefined')
                                {
                                    if (typeof item[fieldToCheck] == 'undefined' || item[fieldToCheck] === null || item[fieldToCheck] === '')
                                    {
                                        if (showLog) this.CH.log('>>> getFilteredData - not set!');
                                    }
                                    else
                                    {
                                        if (showLog) this.CH.log('>>> getFilteredData - NOT match!');
                                        return;
                                    }
                                }
                                else
                                {
                                    if (trueOption == item[fieldToCheck])
                                    {
                                        if (showLog) this.CH.log('>>> getFilteredData - match!');
                                    }
                                    else
                                    {
                                        if (showLog) this.CH.log('>>> getFilteredData - NOT match!');
                                        return;
                                    }
                                }

                                // final check
                                if (this.CH.isItemFoundByCriteria(newItems, 'id', item.id))
                                {
                                    if (showLog) this.CH.log('>>> item already exists, skipping');
                                    return;
                                }
                                else
                                {
                                    if (showLog) this.CH.log('>>> item doesn\'t exist, adding');
                                    newItems.push(item);
                                }
                            });
                        }
                    });
                }
                items = newItems;
            }
            if (showLog) this.CH.log('getFilteredData - end getFilteredData');
        }
        /* *a/

        return items;
    }
    /* */
}
