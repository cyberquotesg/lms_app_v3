// (C) Copyright 2021 Cyberquote Indonesia

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { CqHelper } from '../../services/cq_helper';
import { CqComponent } from '../../classes/cq_component';

@Component({
    selector: 'cq_tags',
    templateUrl: 'cq_tags.html'
})
export class CqTagsComponent extends CqComponent implements OnInit, OnChanges {
    @Input() item: any = {};
    @Input() hideList: string | string[] = "";

    private hideMedia;
    private userStatus;
    private compulsory;
    private courseType;
    private categoryName;

    constructor(CH: CqHelper)
    {
        super(CH);

        let hideList: boolean;
        if (Array.isArray(this.hideList)) hideList = this.hideList;
        else hideList = this.hideList.trim().replace(/ /g, "").split(",");

        this.hideMedia = hideList.includes("hideMedia");
        this.userStatus = hideList.includes("userStatus");
        this.compulsory = hideList.includes("compulsory");
        this.courseType = hideList.includes("courseType");
        this.categoryName = hideList.includes("categoryName");
    }

    ngOnInit(): void
    {
    }
    ngOnChanges(changes: SimpleChanges): void
    {
        this.implementChanges(changes);
    }
}
