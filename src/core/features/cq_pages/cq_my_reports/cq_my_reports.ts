// done v3

import { Component, ViewChild, Renderer2, OnInit } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { CqHelper } from '../services/cq_helper';
import { CqPage } from '../classes/cq_page';
import { ChartData } from 'chart.js';

@Component({
    selector: 'cq_my_reports',
    templateUrl: './cq_my_reports.html',
    styles: ['./cq_my_reports.scss'],
})
export class CqMyReports extends CqPage implements OnInit
{
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
        getCqConfig: {
            value: 0,
            next: {
                getCoursesReports: 0,
            },
        },
    };

    constructor(renderer: Renderer2, CH: CqHelper)
    {
        super(renderer, CH);

        this.pageData.yearsSliderOptions = {
            initialSlide: 0,
            speed: 400,
            centerInsufficientSlides: true,
            centeredSlides: false,
            centeredSlidesBounds: true,
            breakpoints: {},
        };
        let slidesPerView, widthIterator = 80, spaceBetween = 10;
        for (slidesPerView = 1; slidesPerView <= 10; slidesPerView++)
        {
            this.pageData.yearsSliderOptions.breakpoints[slidesPerView * widthIterator] = { slidesPerView, spaceBetween };
        }

        this.pageData.pageSliderOptions = {
            initialSlide: 0,
            speed: 400,
            centerInsufficientSlides: true,
            centeredSlides: true,
            centeredSlidesBounds: true,
            slidesPerView: 1,
        };
    }

    ngOnInit(): void { this.usuallyOnInit(); }
    ionViewWillEnter(): void { this.usuallyOnViewWillEnter(); }
    ionViewDidEnter(): void { this.usuallyOnViewDidEnter(); }
    ionViewWillLeave(): void { this.usuallyOnViewWillLeave(); }
    ionViewDidLeave(): void { this.usuallyOnViewDidLeave(); }

    getCqConfig(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        const params: any = {
            calls: {
                courseTypes: {
                    class: 'CqCourseLib',
                    function: 'get_course_type_of_user',
                },
                cqConfig: {
                    class: 'CqLib',
                    function: 'get_cq_config',
                    name: 'mobile_chart_type,mobile_chart_stacked',
                },
                years: {
                    class: 'CqCourseLib',
                    function: 'get_years_that_have_reports',
                    mode: 'full',
                },
                filterMultiple: {
                    class: 'CqLib',
                    function: 'get_filter_multiple',
                    page: 'my_courses_list',
                },
            },
        };

        this.pageJobExecuter(jobName, params, (data) => {
            let allData = this.CH.toJson(data);

            // courseTypes
            let courseTypesArray: any[] = [];
            for (let id in allData.courseTypes)
            {
                courseTypesArray.push(allData.courseTypes[id]);
            }
            this.pageData.courseTypes = {
                object: allData.courseTypes,
                array: courseTypesArray,
            };

            // cqConfig
            this.pageData.CqConfig = {};
            allData.cqConfig.forEach((config) => {
                this.pageData.CqConfig[config.name] = config.value;
            });

            // years
            if (modeData.mode == 'firstload') this.pageData.selectedYear = allData.years.current;
            this.pageData.currentYear = allData.years.current;
            this.pageData.availableYears = allData.years.available;

            if (modeData.mode == 'firstload')
            {
                // set page slider to the last if this is first call
                this.pageData.yearsSliderOptions.initialSlide = allData.years.available.length - 1;
                this.pageData.pageSliderOptions.initialSlide = allData.years.available.length - 1;
            }

            // filterMultiple
            this.pageData.filterMultiple = allData.filterMultiple;

            if (typeof nextFunction == 'function') nextFunction(jobName, moreloader, refresher, finalCallback);
        }, moreloader, refresher, finalCallback);
    }
    getCoursesReports(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        const params: any = {
            class: 'CqCourseLib',
            function: 'get_courses_reports',
            year: this.pageData.selectedYear,
            include_monthly_data: true,
        };

        this.pageJobExecuter(jobName, params, (data) => {
            type Coordinate = {
                x: number,
                y: number,
            };

            if (typeof this.pageData[this.pageData.selectedYear] == "undefined") this.pageData[this.pageData.selectedYear] = {};
            let thisYearData = this.pageData[this.pageData.selectedYear];

            data = this.CH.toJson(data);
            thisYearData.perCourseType = data.hours.courseTypes;
            thisYearData.courses = data.list;
            thisYearData.coursesFiltered = this.CH.getFilteredData(thisYearData.courses, thisYearData.filterText, thisYearData.filterMultiple);
            thisYearData.totalCPD = data.hours.decimal;
            thisYearData.totalCPDInHours = this.CH.beautifulNumber(data.hours.hours);
            thisYearData.totalCPDInMinutes = this.CH.beautifulNumber(data.hours.minutes);

            for (let courseType of this.pageData.courseTypes.array)
            {
                if (!thisYearData.perCourseType[courseType.jsIdentifier]) continue;
                thisYearData.perCourseType[courseType.jsIdentifier].courses = thisYearData.coursesFiltered.filter((course) => {
                    return (course.type && course.type == courseType.id) || (course.courseType && course.courseType == courseType.id);
                });
            }

            // compile data for chart
            let chartData: ChartData = {
                labels: [
                    '', 'Feb', '', 'Apr', '', 'Jun',
                    '', 'Aug', '', 'Oct', '', 'Dec',
                ],
                datasets: [],
            };
            let datasets: any[] = [];

            var index = 0, courseType, month;
            for (let courseType of this.pageData.courseTypes.array)
            {
                if (courseType.includetocpdhours != 1) continue;
                if (!data.hours.courseTypes[courseType.jsIdentifier]) continue;
                if (!data.hours.courseTypes[courseType.jsIdentifier].raw) continue;

                let dataset: any = {
                    label: courseType.name,
                    fill: false,
                    borderWidth: 2,
                    borderColor: this.CH.getColors(index),
                    backgroundColor: this.CH.getColors(index),
                };

                let x = 0, y = 0;
                // var coordinateData: Coordinate[] = [];
                var coordinateData: number[] = [];
                for (month in data.hours.courseTypes[courseType.jsIdentifier].monthly)
                {
                    x++;
                    y += Number(data.hours.courseTypes[courseType.jsIdentifier].monthly[month].decimal);

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
            thisYearData.chartData = chartData;

            this.adjustScreenHeight(".page-slider-cqmr");
        }, moreloader, refresher, finalCallback);
    }

    selectYear(year): void
    {
        if (this.pageData.selectedYear != year)
        {
            this.pageData.selectedYear = year;
            let yearIndex = this.pageData.availableYears.indexOf(this.pageData.selectedYear);
            this.pageSlider.slideTo(yearIndex);
            if (typeof this.pageData[this.pageData.selectedYear] == "undefined") this.pageForceReferesh();
        }
    }
    pageSliderChange(): void
    {
        if (this.pageStatus)
        {
            this.pageSlider.getActiveIndex().then((index) => {
                this.pageData.selectedYear = this.pageData.availableYears[index];
                if (typeof this.pageData[this.pageData.selectedYear] == "undefined") this.pageForceReferesh();
                else
                {
                    this.adjustScreenHeight(".page-slider-cqmr");
                    this.CH.log('final data', this.pageData);
                }
            });
        }
        else
        {
            this.adjustScreenHeight(".page-slider-cqmr");
        }
    }
    onFilterChange(filter): void
    {
        let thisYearData = this.pageData[this.pageData.selectedYear];
        thisYearData.filterText = filter.text;
        thisYearData.filterMultiple = filter.multiple;
        thisYearData.coursesFiltered = this.CH.getFilteredData(thisYearData.courses, thisYearData.filterText, thisYearData.filterMultiple);

        for (let courseType of this.pageData.courseTypes.array)
        {
            if (!thisYearData.perCourseType[courseType.jsIdentifier]) continue;
            thisYearData.perCourseType[courseType.jsIdentifier].courses = thisYearData.coursesFiltered.filter((course) => {
                return (course.type && course.type == courseType.id) || (course.courseType && course.courseType == courseType.id);
            });
        }

        this.adjustScreenHeight(".page-slider-cqmr");
    }
}
