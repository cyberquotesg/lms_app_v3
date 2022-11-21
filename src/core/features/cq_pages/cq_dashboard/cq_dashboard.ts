// done v3

import { Component, ViewChild, Renderer2, OnInit } from '@angular/core';
import { CqHelper } from '../services/cq_helper';
import { CqPage } from '../classes/cq_page';

@Component({
    selector: 'cq_dashboard',
    templateUrl: './cq_dashboard.html',
    styles: ['cq_dashboard.scss'],
})
export class CqDashboard extends CqPage implements OnInit
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
                myCoursesListAndMyHours: 0,
            },
        },
        additionalContent: 0,
    };
    pageJobLoadMore: any = {
        myCoursesList: 0,
    };

    userFullName: string = '';

    constructor(renderer: Renderer2, CH: CqHelper)
    {
        super(renderer, CH);

        let userId = this.CH.getUserId();
        this.CH.getUser().getUserFullNameWithDefault(userId).then((userFullName) => {
            this.userFullName = userFullName;
        });
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
        const params: any = {
            class: 'CqLib',
            function: 'get_course_types',
            include_non_cpd_hours: true,
        };
        
        this.pageJobExecuter(jobName, params, (data) => {
            data = this.CH.toJson(data);
            let courseTypesArray: any[] = [];
            for (let id in data) courseTypesArray.push(data[id]);
            this.pageData.courseTypes = {
                object: data,
                array: courseTypesArray,
            };

            if (typeof nextFunction == 'function') nextFunction(jobName, moreloader, refresher, finalCallback);
        }, moreloader, refresher, finalCallback);
    }
    myCoursesListAndMyHours(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        // warning! year masih statis
        const params: any = {
            calls: {
                myCoursesList: {
                    class: "CqCourseLib",
                    function: "get_my_courses_list",
                    page: 1,
                    length: 5,
                },
                myHours: {
                    class: "CqCourseLib",
                    function: "get_courses_reports",
                    year: 2022,
                    return: "hours",
                },
            },
        };

        this.pageJobExecuter(jobName, params, (data) => {
            let allData = this.CH.toJson(data),
                callId, courses, hours;

            for (callId in allData)
            {
                if (callId == "myCoursesList")
                {
                    courses = allData[callId];
                    this.reachedEndOfList = this.CH.isEmpty(courses) || this.CH.getLength(courses) < modeData.length;
                    if (this.CH.isEmpty(courses)) return;

                    if (modeData.mode == 'firstload') this.pageData.courses = courses;
                    else if (modeData.mode == 'loadingmore') this.pageData.courses = this.pageData.courses.concat(courses);
                    else if (modeData.mode == 'refreshing') this.pageData.courses = courses;
                }
                else if (callId == "myHours")
                {
                    hours = allData[callId];
                    let brokenDownData = this.CH.breakDownHoursData(this.pageData.courseTypes.array, hours);

                    this.pageData.dashMinutes = brokenDownData.totalCPDInMinutesBeautiful;
                    this.pageData.dashHours = brokenDownData.totalCPDInHoursBeautiful;
                }
            }
        }, moreloader, refresher, finalCallback);
    }
    additionalContent(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        const params: any = {
            class: 'CqLib',
            function: 'get_contents_additional',
            content_type: 'mobile',
        };

        this.pageJobExecuter(jobName, params, (data) => {
            this.pageData.additionalContent = data.length ? data[0].mobile_content : "";
        }, moreloader, refresher, finalCallback);
    }
}
