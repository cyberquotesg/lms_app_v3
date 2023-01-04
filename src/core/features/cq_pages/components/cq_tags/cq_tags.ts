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

    private hideMedia: boolean;
    private hideUserStatus: boolean;
    private hideCompulsory: boolean;
    private hideCourseType: boolean;
    private hideCategoryName: boolean;

    constructor(CH: CqHelper)
    {
        super(CH);

        let hideList: string[];
        if (Array.isArray(this.hideList)) hideList = this.hideList;
        else hideList = this.hideList.trim().replace(/ /g, "").split(",");

        this.hideMedia = hideList.includes("media");
        this.hideUserStatus = hideList.includes("userStatus");
        this.hideCompulsory = hideList.includes("compulsory");
        this.hideCourseType = hideList.includes("courseType");
        this.hideCategoryName = hideList.includes("categoryName");
    }

    ngOnInit(): void
    {
    }
    ngOnChanges(changes: SimpleChanges): void
    {
        this.implementChanges(changes);
    }
}
