// done v3

import { Component, ViewChild, Renderer2, OnInit } from '@angular/core';
import { CqHelper } from '@services/cq_helper';
import { CqPage } from '@classes/cq_page';

@Component({
    selector: 'cq_dashboard_main',
    templateUrl: './cq_dashboard_main.html',
    styles: ['cq_dashboard_main.scss'],
})
export class CqDashboardMain extends CqPage implements OnInit
{
    pageParams = {
    };
    pageDefaults: any = {
        courseTypes: [],
        courses: [],
        dashHours: '00',
        dashMinutes: '00',
        additionalContent: '',
    };
    pageJob: any = {
        courseTypes: {
            value: 0,
            next: {
                myHours: 0,
                myCoursesList: 0,
            },
        },
        additionalContent: 0,
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

    /* function to get course types
     * pageDefaults -> courseTypes: [],
     * pageJob -> courseTypes: 0,
     * 
     * if courseTypesAdditionalFunction is defined, then it will be executed
     * 
     * require page with cqOrganization
    */
    courseTypes(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        this.pageJobExecuter(jobName, 'CqLib', 'get_course_types', [this.CH.getUserId()], (data) => {
            data = this.CH.toJson(data);
            let courseTypesArray = [];
            for (let id in data) courseTypesArray.push(data[id]);
            this.pageData.courseTypes = {
                object: data,
                array: courseTypesArray,
            };

            if (typeof nextFunction == 'function') nextFunction(jobName, moreloader, refresher, finalCallback);
        }, moreloader, refresher, finalCallback);
    }

    myCoursesList(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        this.pageJobExecuter(jobName, 'CqLib', 'get_my_courses_list', [
            this.CH.getUserId(),
            0,
            'desc',
            1,
            5,
        ], (data) => {
            let result = this.CH.toJson(data);
            this.reachedEndOfList = this.CH.isEmpty(result) || this.CH.getLength(result) < modeData.length;
            if (this.CH.isEmpty(result)) return;

            if (modeData.mode == 'firstload') this.pageData.courses = result;
            else if (modeData.mode == 'loadingmore') this.pageData.courses = this.pageData.courses.concat(result);
            else if (modeData.mode == 'refreshing') this.pageData.courses = result;
        }, moreloader, refresher, finalCallback);
    }

    myHours(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        this.pageJobExecuter(jobName, 'custom', 'local_classroom_training_my_hours', null, (data) => {
            let brokenDownData = this.CL.breakDownHoursData(this.pageData.courseTypes.array, data);

            this.pageData.dashMinutes = brokenDownData.totalCPDInMinutesBeautiful;
            this.pageData.dashHours = brokenDownData.totalCPDInHoursBeautiful;
        }, moreloader, refresher, finalCallback);
    }
    additionalContent(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        this.pageJobExecuter(jobName, 'raw', 'get_content_additional', null, (data) => {
            this.pageData.additionalContent = data;
        }, moreloader, refresher, finalCallback);
    }
}
