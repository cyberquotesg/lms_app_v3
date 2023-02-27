// (C) Copyright 2021 Cyberquote Indonesia

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, SimpleChange, ViewChild} from '@angular/core';
import { CqHelper } from '../../services/cq_helper';
import { CqComponent } from '../../classes/cq_component';

@Component({
    selector: 'cq_filter_modal',
    templateUrl: 'cq_filter_modal.html'
})
export class CqFilterComponentModal extends CqComponent implements OnInit, OnChanges {
    @Input() filterMultiple: any[];
    @Input() filterMultipleTitle?: string;

    filterMultipleInternal: any[] = [];

    constructor(CH: CqHelper)
    {
        super(CH);
    }

    ngOnInit(): void
    {
        this.filterMultipleInternal = this.CH.cloneJson(this.filterMultiple);
    }
    ngOnChanges(changes: SimpleChanges): void
    {
        this.implementChanges(changes);
        this.filterMultipleInternal = this.CH.cloneJson(this.filterMultiple);
    }

    toggleOption(option: any): void
    {
        option.selected = !option.selected;
    }
    optionsSelectedCount(options: any[]): string
    {
        let total: number = 0;
        let totalSelected: number = 0;

        options.forEach((option) => {
            total++;
            if (option.selected) totalSelected++;
        });

        if (totalSelected == 0) return "none";
        else if (total == totalSelected) return "all";
        else return "some";
    }
    setOptions(options: any): void
    {
        let value = this.optionsSelectedCount(options) != "all";
        options.forEach((option) => {
            option.selected = value;
        });
    }
    getClassByOptionsSelected(options: any): string
    {
        let value = this.optionsSelectedCount(options);

        if (value == "all") return "active";
        else return "";
    }
    applyFilter(apply: boolean): void
    {
        let returnData: any = {apply};
        if (apply) returnData.filterMultiple = this.filterMultipleInternal;

        this.CH.dismissModal(returnData);
    }
}
