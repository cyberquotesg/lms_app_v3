// (C) Copyright 2022 Cyberquote Indonesia

import { Component, ViewChild, Renderer2, OnInit } from '@angular/core';
import { CqHelper } from '../services/cq_helper';
import { CqPage } from '../classes/cq_page';

@Component({
    selector: 'cq_my_courses',
    templateUrl: './cq_my_courses.html',
    styles: ['cq_my_courses.scss'],
})
export class CqMyCourses extends CqPage implements OnInit
{
    pageParams: any = {
    };
    pageDefaults: any = {
        filterMultiple: [],
        courses: [],
        filterAgent: null,
        filterText: "",
        reachedEndOfList: false,
        page: this.page,
        length: this.length,
    };
    pageJob: any = {
        filterMultiple: {
            value: 0,
            next: {
                myCoursesList: 0,
            }
        },
    };
    pageJobRefresh: any = {
        myCoursesList: 0,
    };

    constructor(renderer: Renderer2, CH: CqHelper)
    {
        super(renderer, CH);
    }

    ngOnInit(): void { this.usuallyOnInit(); }
    ionViewWillEnter(): void { this.usuallyOnViewWillEnter(); }
    ionViewDidEnter(): void { this.usuallyOnViewDidEnter(); }
    ionViewWillLeave(): void { this.usuallyOnViewWillLeave(); }
    ionViewDidLeave(): void { this.usuallyOnViewDidLeave(); }

    filterMultiple(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        const params: any = {
            class: 'CqLib',
            function: 'get_filter_multiple',
            page: 'my_courses_list',
        };

        this.pageJobExecuter(jobName, params, (data) => {
            this.pageData.filterMultiple = this.CH.toJson(data);

            if (typeof nextFunction == 'function') nextFunction(jobName, moreloader, refresher, finalCallback);
        }, moreloader, refresher, finalCallback);
    }
    myCoursesList(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        // don't use modeData.mode, but use it's own duplicated functionality
        let page, length;
        if (modeData.mode == 'firstload' || modeData.mode == 'forced-firstload')
        {
            this.pageData.page = 1;
            page = this.pageData.page;
            length = this.pageData.length;
        }
        else if (modeData.mode == 'loadmore' || modeData.mode == 'forced-loadmore')
        {
            this.pageData.page++;
            page = this.pageData.page;
            length = this.pageData.length;
        }
        else if (modeData.mode == 'refresh' || modeData.mode == 'forced-refresh')
        {
            page = 1;
            length = this.pageData.page * this.pageData.length;
        }
        else
        {
            page = this.pageData.page;
            length = this.pageData.length;
        }

        const params: any = {
            class: "CqCourseLib",
            function: "get_my_courses_list",
            page: page,
            length: length,
            search: this.pageData.filterText ? this.pageData.filterText : null,
        };
        this.pageData.filterMultiple.forEach((item) => {
            let bucket: any[] = [];
            item.options.forEach((option) => {
                if (option.selected) bucket.push(option.value);
            });
            params[item.plural] = bucket.join(",");
        });

        this.pageJobExecuter(jobName, params, (data) => {
            let courses = this.CH.toArray(this.CH.toJson(data));
            this.reachedEndOfList = this.CH.isEmpty(courses) || this.CH.getLength(courses) < modeData.length;

            if (modeData.mode != 'loadmore' && modeData.mode != 'forced-loadmore') this.pageData.courses = courses;
            else this.pageData.courses = this.pageData.courses.concat(courses);

            if (typeof nextFunction == 'function') nextFunction(jobName, moreloader, refresher, finalCallback);
        }, moreloader, refresher, finalCallback);
    }

    onFilterChange(data: any): void
    {
        this.pageIsLoading = true;
        clearTimeout(this.pageData.filterAgent);
        let locaAgent = this.pageData.filterAgent = setTimeout(() => {
            if (locaAgent != this.pageData.filterAgent)
            {
                this.CH.log("filter rejected: agent is different");

                this.pageIsLoading = false;
                return;
            }

            let newText = data.text.trim().toLowerCase();
            let textIsSame = newText == this.pageData.filterText;

            let newMultiple = this.CH.cloneJson(data.filterMultiple);
            let multipleIsSame = true;
            for (let i in newMultiple)
            {
                for (let o in newMultiple[i].options)
                {
                    if (newMultiple[i].options[o].selected != this.pageData.filterMultiple[i].options[o].selected)
                    {
                        multipleIsSame = false;
                        break;
                    }
                }

                if (!multipleIsSame) break;
            }

            if (textIsSame && multipleIsSame)
            {
                this.CH.log("filter rejected: textIsSame", textIsSame);
                this.CH.log("filter rejected: multipleIsSame", multipleIsSame);

                this.pageIsLoading = false;
                return;
            }

            this.pageData.filterText = newText;
            this.pageData.filterMultiple = newMultiple;
            this.pageForceReferesh();
        }, 1000);
    }
}
