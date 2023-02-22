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

    private finalTags: any[] = [];

    constructor(CH: CqHelper)
    {
        super(CH);
    }

    ngOnInit(): void
    {
        let hideList: string[];
        if (Array.isArray(this.hideList)) hideList = this.hideList;
        else hideList = this.hideList.trim().replace(/ /g, "").split(",");

        if (!hideList.includes("media"))
        {
            if (this.item.media == "online") this.finalTags.push({text: "E-Learning"});
            else if (this.item.media == "offline") this.finalTags.push({text: "Classroom Training"});
        }
        if (!hideList.includes("userStatus"))
        {
            if (this.item.isUserEnrolled && !this.item.isUserFinished && !this.item.isUserAccredited)
            {
                if (!this.item.isCourseEnded) this.finalTags.push({text: "Enrolled", class: "green"});
                else this.finalTags.push({text: "Failed", class: "red"});
            }
            else if (this.item.isUserEnrolled && this.item.isUserFinished && !this.item.isUserAccredited)
            {
                this.finalTags.push({text: "Finished", class: "green"});
            }
            else if (this.item.isUserEnrolled && this.item.isUserFinished && this.item.isUserAccredited)
            {
                this.finalTags.push({text: "Accredited", class: "green", icon: "checkmark-circle"});
            }
        }
        if (!hideList.includes("compulsory"))
        {
            if (this.item.compulsory === true || this.item.compulsory === 1 || this.item.compulsory === '1')
            {
                this.finalTags.push({text: "Compulsory", class: "orange"});
            }
        }
        if (!hideList.includes("courseType"))
        {
            if (this.item.typeText || this.item.finalCourseTypeText || this.item.courseTypeText)
            {
                this.finalTags.push({text: this.item.typeText || this.item.finalCourseTypeText || this.item.courseTypeText, class: "dark-grey"});
            }
        }
        if (!hideList.includes("categoryName"))
        {
            if (this.item.categoryname || this.item.categoryName)
            {
                this.finalTags.push({text: this.item.categoryname || this.item.categoryName, class: "dark-grey"});
            }
        }
        if (this.item.tags && Array.isArray(this.item.tags) && this.item.tags.length > 0)
        {
            this.item.tags.forEach((tag) => this.finalTags.push({text: tag}));
        }
    }
    ngOnChanges(changes: SimpleChanges): void
    {
        this.implementChanges(changes);
    }
}
