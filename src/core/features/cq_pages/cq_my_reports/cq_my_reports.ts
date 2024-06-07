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

    pageParams: any = {
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
                    cluster: 'CqCourseLib',
                    endpoint: 'get_course_types_of_user',
                    include_non_cpd_hours: true,
                    include_empty_option: true,
                },
                cqConfig: {
                    cluster: 'CqLib',
                    endpoint: 'get_cq_config',
                    name: 'mobile_chart_type,mobile_chart_stacked,mobile_chart_line_tension',
                },
                years: {
                    cluster: 'CqCourseLib',
                    endpoint: 'get_years_that_have_reports',
                    mode: 'full',
                },
                filterMultiple: {
                    cluster: 'CqLib',
                    endpoint: 'get_filter_multiple',
                    page: 'my_reports',
                },
            },
        };

        this.pageJobExecuter(jobName, params, (data) => {
            let allData = this.CH.toJson(data);

            // courseTypes
            let courseTypesArray: any[] = [];
            for (let id in allData.courseTypes) courseTypesArray.push(allData.courseTypes[id]);
            var courseTypes : any = {
                object: allData.courseTypes,
                array: courseTypesArray,
            };
            if (!this.CH.isSame(this.pageData.courseTypes, courseTypes))
            {
                this.pageData.courseTypes = courseTypes;
            }

            // cqConfig
            var cqConfig : any = {}; allData.cqConfig.forEach((config) => cqConfig[config.name] = config.value);
            if (!this.CH.isSame(this.pageData.CqConfig, cqConfig))
            {
                this.pageData.CqConfig = cqConfig;
            }

            // years
            if (modeData.mode == 'firstload')
            {
                this.pageData.selectedYear = allData.years.current;
            }
            if (!this.CH.isSame(this.pageData.currentYear, allData.years.current))
            {
                this.pageData.currentYear = allData.years.current;
            }
            if (!this.CH.isSame(this.pageData.availableYears, allData.years.available))
            {
                this.pageData.availableYears = allData.years.available;
            }

            if (modeData.mode == 'firstload')
            {
                // set page slider to the last if this is first call
                this.pageData.yearsSliderOptions.initialSlide = allData.years.available.length - 1;
                this.pageData.pageSliderOptions.initialSlide = allData.years.available.length - 1;
            }

            // filterMultiple
            if (!this.CH.isSame(this.pageData.filterMultiple, allData.filterMultiple))
            {
                this.pageData.filterMultiple = allData.filterMultiple;
            }

            if (typeof nextFunction == 'function') nextFunction(jobName, moreloader, refresher, finalCallback);
        }, moreloader, refresher, finalCallback);
    }
    getCoursesReports(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        const params: any = {
            cluster: 'CqCourseLib',
            endpoint: 'get_courses_reports',
            year: this.pageData.selectedYear,
            include_monthly_data: true,
        };

        this.pageJobExecuter(jobName, params, async (data) => {
            type Coordinate = {
                x: number,
                y: number,
            };

            let thisYearData: any = {};

            data = this.CH.toJson(data);
            thisYearData.courses = data.list;
            thisYearData.coursesFiltered = this.CH.getFilteredData(thisYearData.courses, thisYearData.filterText, thisYearData.filterMultiple);
            thisYearData.totalCPD = data.hours.decimal;
            thisYearData.totalCPDInHours = this.CH.beautifulNumber(data.hours.hours);
            thisYearData.totalCPDInMinutes = this.CH.beautifulNumber(data.hours.minutes);

            thisYearData.perCourseType = data.hours.courseTypes;
            for (let courseType of this.pageData.courseTypes.array)
            {
                if (!thisYearData.perCourseType[courseType.jsIdentifier]) continue;
                if (!thisYearData.perCourseType[courseType.jsIdentifier].courses) thisYearData.perCourseType[courseType.jsIdentifier].courses = [];
                let temp = thisYearData.coursesFiltered.filter((course) => {
                    return (typeof course.type != "undefined" && course.type == courseType.id) || (typeof course.courseType != "undefined" && course.courseType == courseType.id);
                });

                thisYearData.perCourseType[courseType.jsIdentifier].courses = thisYearData.perCourseType[courseType.jsIdentifier].courses.concat(temp);
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

            datasets.sort(function(a, b){
                let i, a_index = 0, b_index = 0;

                for (i in a.data)
                {
                    if (a.data[i] != 0)
                    {
                        a_index = Number(i);
                        break;
                    }
                }

                for (i in b.data)
                {
                    if (b.data[i] != 0)
                    {
                        b_index = Number(i);
                        break;
                    }
                }

                if (a_index > b_index) return 1;
                else if (a_index < b_index) return -1;
                else return 0;
            });

            chartData.datasets = datasets;
            thisYearData.chartData = chartData;

            if (!this.CH.isSame(this.pageData[this.pageData.selectedYear], thisYearData))
            {
                this.pageData[this.pageData.selectedYear] = thisYearData;
            }

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
    onFilterChange(data: any): void
    {
        let thisYearData = this.pageData[this.pageData.selectedYear];
        thisYearData.filterText = data.text.trim().toLowerCase();
        thisYearData.filterMultiple = this.CH.cloneJson(data.filterMultiple);
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
