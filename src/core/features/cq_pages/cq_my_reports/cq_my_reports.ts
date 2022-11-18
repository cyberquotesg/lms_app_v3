// done v3

import { Component, ViewChild, Renderer2, OnInit } from '@angular/core';
import { CqHelper } from '../services/cq_helper';
import { CqPage } from '../classes/cq_page';
// import { CqFilterComponent } from '../components/cq-filter/cq-filter';

@Component({
    selector: 'cq_my_reports',
    templateUrl: './cq_my_reports.html',
    styles: ['cq_my_reports.scss'],
})
export class CqMyReports extends CqPage implements OnInit
{
    // @ViewChild(CqFilterComponent) filter: CqFilterComponent;

    pageParams = {
    };
    pageDefaults: any = {
        filterMultiple: [],
        courseTypes: [],
        courses: {},
        coursesFiltered: [],
        perCourseType: {},
        availableYears: [],
        year: 0,
        totalCPD: 0,
        totalCPDInMinutes: 0,
        totalCPDInHours: 0,
        customChartData: [],
    };
    pageJob: any = {
        filterMultiple: 0,
        getYears: 0,
        courseTypes: {
            value: 0,
            next: {
                getCoursesReports: 0,
            },
        },
    };

    availableYears: number[] = [];
    year: number = 0;

    constructor(renderer: Renderer2, CH: CqHelper)
    {
        super(renderer, CH);

        this.year = new Date().getFullYear();
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
    getYears(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        const params: any = {
            class: 'CqCourseLib',
            function: 'get_years_that_have_reports',
            mode: 'full',
        };

        this.pageJobExecuter(jobName, params, (data) => {
            let yearsData = this.CH.toJson(data);

            this.pageData.year = yearsData.current;
            this.availableYears = this.pageData.availableYears = yearsData.available;
        }, moreloader, refresher, finalCallback);
    }

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

    getCoursesReports(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        const params: any = {
            class: 'CqCourseLib',
            function: 'get_courses_reports',
            year: this.year,
        };

        this.pageJobExecuter(jobName, params, (data) => {
            data = this.CH.toJson(data);
            this.pageData.perCourseType = data.hours.courseTypes;
            this.pageData.courses = data.list;
            this.pageData.totalCPD = data.hours.decimal,
            this.pageData.totalCPDInHours = this.CH.beautifulNumber(data.hours.hours),
            this.pageData.totalCPDInMinutes = this.CH.beautifulNumber(data.hours.minutes),
            this.pageData.customChartData = this.CH.getCustomChartData(this.pageData.perCourseType);

            // this.pageData.coursesFiltered = this.filter.getFilteredData(this.pageData.courses);
            this.pageData.coursesFiltered = this.pageData.courses;
        }, moreloader, refresher, finalCallback);
    }

    selectYear(year): void
    {
        if (this.year != year)
        {
            this.year = year;
            this.pageSoftForceReferesh();
        }
    }

    onFilterChange(): void
    {
        // this.pageData.coursesFiltered = this.filter.getFilteredData(this.pageData.courses);
        this.pageData.coursesFiltered = this.pageData.courses;
    }
}
