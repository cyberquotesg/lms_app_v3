// done v3

import { Component, ViewChild, Renderer2, OnInit } from '@angular/core';
import { CqHelper } from '../services/cq_helper';
import { CqPage } from '../classes/cq_page';
// import { CqFilterComponent } from '../components/cq-filter/cq-filter';

@Component({
    selector: 'cq_my_courses',
    templateUrl: './cq_my_courses.html',
    styles: ['cq_my_courses.scss'],
})
export class CqMyCourses extends CqPage implements OnInit
{
    // @ViewChild(CqFilterComponent) filter: CqFilterComponent;

    pageParams = {
    };
    pageDefaults: any = {
        filterMultiple: [],
        courses: [],
        filterAgent: null,
        filterText: "",
    };
    pageJob: any = {
        filterMultiple: {
            value: 0,
            next: {
                myCoursesList: 0,
            }
        },
    };
    pageJobLoadMore: any = {
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
        const params: any = {
            class: "CqCourseLib",
            function: "get_my_courses_list",
            page: 1,
            length: 5,
            search: this.pageData.filterText ? this.pageData.filterText : null,
        };

        this.pageJobExecuter(jobName, params, (data) => {
            let result = this.CH.toArray(this.CH.toJson(data));
            this.reachedEndOfList = this.CH.isEmpty(result) || this.CH.getLength(result) < modeData.length;

            if (modeData.mode != 'loadmore') this.pageData.courses = result;
            else this.pageData.courses = this.pageData.courses.concat(result);
        }, moreloader, refresher, finalCallback);
    }

    onFilterChange(data: any): void
    {
        this.pageIsLoading = true;
        clearTimeout(this.pageData.filterAgent);
        let locaAgent = this.pageData.filterAgent = setTimeout(() => {
            let text = data.text.trim().toLowerCase();

            if (locaAgent != this.pageData.filterAgent || text == this.pageData.filterText)
            {
                this.pageIsLoading = false;
                return;
            }

            this.pageData.filterText = data.text;
            this.pageForceReferesh();
        }, 1000);
    }
}
