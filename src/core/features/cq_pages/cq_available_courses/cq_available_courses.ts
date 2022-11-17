// done v3

import { Component, ViewChild, Renderer2, OnInit } from '@angular/core';
import { CqHelper } from '../services/cq_helper';
import { CqPage } from '../classes/cq_page';
// import { CqFilterComponent } from '../components/cq-filter/cq-filter';

@Component({
    selector: 'cq_available_courses',
    templateUrl: './cq_available_courses.html',
    styles: ['cq_available_courses.scss'],
})
export class CqAvailableCourses extends CqPage implements OnInit
{
    // @ViewChild(CqFilterComponent) filter: CqFilterComponent;

    pageParams = {
    };
    pageDefaults: any = {
        filterMultiple: [],
        courses: [],
        coursesFiltered: [],
    };
    pageJob: any = {
        filterMultiple: {
            value: 0,
            next: {
                availableCourses: 0,
            }
        },
    };
    pageJobLoadMore: any = {
        courses: 0,
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
    availableCourses(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        const params: any = {
            calls: {
                onlineCourses: {
                    class: "CqCourseLib",
                    function: "get_e_learning_list",
                    page: modeData.page,
                    length: modeData.length,
                },
                offlineCourses: {
                    class: "CqCourseLib",
                    function: "get_classroom_training_list",
                    page: modeData.page,
                    length: modeData.length,
                },
            },
        };

        this.pageJobExecuter(jobName, params, (data) => {
            let allCourses = this.CH.toJson(data),
                callId, courses;

            for (callId in allCourses)
            {
                if (callId == "onlineCourses")
                {
                    courses = allCourses[callId];
                    this.reachedEndOfList = this.CH.isEmpty(courses) || this.CH.getLength(courses) < modeData.length;
                    if (this.CH.isEmpty(courses)) return;

                    if (modeData.mode == 'firstload') this.pageData.courses = courses;
                    else if (modeData.mode == 'loadingmore') this.pageData.courses = this.pageData.courses.concat(courses);
                    else if (modeData.mode == 'refreshing') this.pageData.courses = courses;
                    // this.pageData.coursesFiltered = this.filter.getFilteredData(this.pageData.courses);
                }
                else if (callId == "offlineCourses")
                {
                    courses = allCourses[callId];
                    this.reachedEndOfList = this.CH.isEmpty(courses) || this.CH.getLength(courses) < modeData.length;
                    if (this.CH.isEmpty(courses)) return;

                    // aditional information
                    for (let id in courses)
                    {
                        courses[id].letter = "A"; //courses[id].name.substr(0, 1);
                        courses[id].venue = courses[id].venue ? courses[id].venue : '-';
                        courses[id].media = 'offline';
                    }

                    if (modeData.mode == 'firstload') this.pageData.courses = courses;
                    else if (modeData.mode == 'loadingmore') this.pageData.courses = this.pageData.courses.concat(courses);
                    else if (modeData.mode == 'refreshing') this.pageData.courses = courses;
                    // this.pageData.coursesFiltered = this.filter.getFilteredData(this.pageData.courses);
                    this.pageData.coursesFiltered = this.pageData.courses;
                }
            }
        }, moreloader, refresher, finalCallback);
    }

    onFilterChange(): void
    {
        // this.pageData.coursesFiltered = this.filter.getFilteredData(this.pageData.courses);
        this.pageData.coursesFiltered = this.pageData.courses;
    }
}
