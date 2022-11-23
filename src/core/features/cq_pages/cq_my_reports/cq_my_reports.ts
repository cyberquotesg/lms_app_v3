// done v3

import { Component, ViewChild, Renderer2, OnInit } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { CqHelper } from '../services/cq_helper';
import { CqPage } from '../classes/cq_page';
import { ChartData } from 'chart.js';
// import { CqFilterComponent } from '../components/cq-filter/cq-filter';

@Component({
    selector: 'cq_my_reports',
    templateUrl: './cq_my_reports.html',
    styles: ['./cq_my_reports.scss'],
})
export class CqMyReports extends CqPage implements OnInit
{
    // @ViewChild(CqFilterComponent) filter: CqFilterComponent;
    @ViewChild('pageSlider', { static: true }) private pageSlider: IonSlides;

    pageParams = {
    };
    pageDefaults: any = {
        filterMultiple: [],
        courseTypes: [],
        currentYear: 0,
        availableYears: [],
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

    year: number = 0;

    yearsSliderOptions = {
        initialSlide: 0,
        speed: 400,
        centerInsufficientSlides: true,
        centeredSlides: true,
        centeredSlidesBounds: true,
        breakpoints: {
            320: {slidesPerView: 4, spaceBetween: 10},
            400: {slidesPerView: 5, spaceBetween: 10},
            480: {slidesPerView: 6, spaceBetween: 10},
            560: {slidesPerView: 7, spaceBetween: 10},
            640: {slidesPerView: 8, spaceBetween: 10},
            720: {slidesPerView: 9, spaceBetween: 10},
            800: {slidesPerView: 10, spaceBetween: 10},
        },
    };
    pageSliderOptions = {
        initialSlide: 0,
        speed: 400,
        centerInsufficientSlides: true,
        centeredSlides: true,
        centeredSlidesBounds: true,
        slidesPerView: 1,
    };

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

    selectYear(year): void
    {
        if (this.year != year)
        {
            this.year = year;
            let yearIndex = this.pageData.availableYears.indexOf(this.year);
            this.pageSlider.slideTo(yearIndex);
            if (typeof this.pageData[this.year] == "undefined") this.pageSoftForceReferesh();
        }
    }
    pageSliderChange(): void
    {
        if (this.pageStatus)
        {
            this.pageSlider.getActiveIndex().then((index) => {
                this.year = this.pageData.availableYears[index];
                if (typeof this.pageData[this.year] == "undefined") this.pageSoftForceReferesh();
            });
        }
    }

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

            this.pageData.currentYear = yearsData.current;
            this.pageData.availableYears = yearsData.available;

            // set page slider to the last if this is first call
            if (!this.pageStatus)
            {
                this.yearsSliderOptions.initialSlide = yearsData.available.length - 1;
                this.pageSliderOptions.initialSlide = yearsData.available.length - 1;
            }
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
            class: 'CqCourseLib',
            function: 'get_course_type_of_user',
        };

        this.pageJobExecuter(jobName, params, (data) => {
            data = this.CH.toJson(data);
            let courseTypesArray: any[] = [];

            for (let id in data)
            {
                courseTypesArray.push(data[id]);
            }

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
            include_monthly_data: true,
        };

        this.pageJobExecuter(jobName, params, (data) => {
            type Coordinate = {
                x: number,
                y: number,
            };

            if (typeof this.pageData[this.year] == "undefined") this.pageData[this.year] = {};

            data = this.CH.toJson(data);
            this.pageData[this.year].perCourseType = data.hours.courseTypes;
            this.pageData[this.year].courses = data.list;
            this.pageData[this.year].totalCPD = data.hours.decimal,
            this.pageData[this.year].totalCPDInHours = this.CH.beautifulNumber(data.hours.hours),
            this.pageData[this.year].totalCPDInMinutes = this.CH.beautifulNumber(data.hours.minutes),

            // this.pageData[this.year].coursesFiltered = this.filter.getFilteredData(this.pageData[this.year].courses);
            this.pageData[this.year].coursesFiltered = this.pageData[this.year].courses;

            for (let courseType of this.pageData.courseTypes.array)
            {
                this.pageData[this.year].perCourseType[courseType.jsIdentifier].courses = this.pageData[this.year].coursesFiltered.filter((course) => {
                    return (course.type && course.type == courseType.id) ||(course.courseType && course.courseType == courseType.id);
                });
            }

            // compile data for chart
            let chartData: ChartData = {
                labels: [
                    /* *a/
                    'Jan', 'Feb',
                    'Mar', 'Apr',
                    'May', 'Jun',
                    'Jul', 'Aug',
                    'Sep', 'Oct',
                    'Nov', 'Dec',
                    /* */

                    '', 'Feb',
                    '', 'Apr',
                    '', 'Jun',
                    '', 'Aug',
                    '', 'Oct',
                    '', 'Dec',
                ],
                datasets: [],
            };
            let datasets: any[] = [];

            var index = 0, courseType, month;
            for (courseType in data.hours.courseTypes)
            {
                if (!data.hours.courseTypes[courseType].raw) continue;

                let dataset: any = {
                    label: this.CH.camelToHumanText(courseType),
                    fill: false,
                    borderWidth: 2,
                    borderColor: this.CH.getColors(index),
                    backgroundColor: this.CH.getColors(index),
                };

                let x = 0, y = 0;
                // var coordinateData: Coordinate[] = [];
                var coordinateData: number[] = [];
                for (month in data.hours.courseTypes[courseType].monthly)
                {
                    x++;
                    y += Number(data.hours.courseTypes[courseType].monthly[month].decimal);

                    let coordinate: Coordinate = {
                        x: x,
                        y: y,
                    };

                    // coordinateData.push(coordinate);
                    coordinateData.push(y);
                }

                // dataset.data = coordinateData;
                dataset.data = coordinateData;
                datasets.push(dataset);
                index++;
            }

            chartData.datasets = datasets;
            this.pageData[this.year].chartData = chartData;
        }, moreloader, refresher, finalCallback);
    }

    toHumanText(text: string): string
    {
        return this.CH.toHumanText(text);
    }

    onFilterChange(): void
    {
        // this.pageData[this.year].coursesFiltered = this.filter.getFilteredData(this.pageData[this.year].courses);
        this.pageData[this.year].coursesFiltered = this.pageData[this.year].courses;
    }
}
