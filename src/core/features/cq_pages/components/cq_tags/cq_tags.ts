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

    private showMedia: boolean;
    private showUserStatus: boolean;
    private showCompulsory: boolean;
    private showCourseType: boolean;
    private showCategoryName: boolean;
    private tags: string[] = [];
    private showTags: boolean;
    private finalShow: boolean;

    constructor(CH: CqHelper)
    {
        super(CH);
    }

    ngOnInit(): void
    {
        let hideList: string[];
        if (Array.isArray(this.hideList)) hideList = this.hideList;
        else hideList = this.hideList.trim().replace(/ /g, "").split(",");

        let item = this.item;
        this.showMedia = !hideList.includes("media") && typeof item.media != "undefined";
        this.showUserStatus = !hideList.includes("userStatus");
        this.showCompulsory = !hideList.includes("compulsory") && (item.compulsory === true || item.compulsory === 1 || item.compulsory === '1');
        this.showCourseType = !hideList.includes("courseType") && (item.typeText || item.finalCourseTypeText || item.courseTypeText);
        this.showCategoryName = !hideList.includes("categoryName") && (item.categoryname || item.categoryName);
        if (item.tags)
        {
            if (Array.isArray(item.tags)) this.tags = item.tags;
            else this.tags = item.tags.trim().replace(/ /g, "").split(",");
        }
        this.showTags = this.tags.length > 0;

        this.finalShow = this.showMedia || this.showUserStatus || this.showCompulsory || this.showCourseType || this.showCategoryName || this.showTags;
    }
    ngOnChanges(changes: SimpleChanges): void
    {
        this.implementChanges(changes);
    }
}
