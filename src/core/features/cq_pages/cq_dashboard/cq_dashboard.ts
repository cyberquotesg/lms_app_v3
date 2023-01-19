// done v3

import { Component, ViewChild, Renderer2, OnInit } from '@angular/core';
import { CoreNavigationOptions, CoreNavigator } from '@services/navigator';
import { CqHelper } from '../services/cq_helper';
import { CqPage } from '../classes/cq_page';

@Component({
    selector: 'cq_dashboard',
    templateUrl: './cq_dashboard.html',
    styles: ['cq_dashboard.scss'],
})
export class CqDashboard extends CqPage implements OnInit
{
    pageParams: any = {
    };
    pageDefaults: any = {
        filterMultiple: [],
        userFullName: '',
        dashHours: '00',
        dashMinutes: '00',
        title: '',
    };
    pageJob: any = {
        filterMultiple: {
            value: 0,
            next: {
                getAllData: 0,
            }
        },
    };

    constructor(renderer: Renderer2, CH: CqHelper)
    {
        super(renderer, CH);
    }

    ngOnInit(): void {
        this.usuallyOnInit(() => {
            let userId = this.CH.getUserId();
            this.CH.getUser().getUserFullNameWithDefault(userId).then((userFullName) => {
                this.pageData.userFullName = userFullName;
            });

            this.pageData.year = new Date().getFullYear();

            // setup slide options
            this.pageData.sliderOptions = {
                initialSlide: 0,
                speed: 400,
                centerInsufficientSlides: false,
                centeredSlides: false,
                centeredSlidesBounds: false,
                breakpoints: {},
            };
            let slidesPerView, widthIterator = 160, spaceBetween = 24;
            for (slidesPerView = 1; slidesPerView <= 10; slidesPerView++)
            {
                this.pageData.sliderOptions.breakpoints[slidesPerView * widthIterator] = { slidesPerView, spaceBetween };
            }

            this.pageData.title = this.CH.getOrganization("name");
        });
    }
    ionViewWillEnter(): void { this.usuallyOnViewWillEnter(); }
    ionViewDidEnter(): void { this.usuallyOnViewDidEnter(); }
    ionViewWillLeave(): void { this.usuallyOnViewWillLeave(); }
    ionViewDidLeave(): void { this.usuallyOnViewDidLeave(); }

    filterMultiple(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        const params: any = {
            class: 'CqLib',
            function: 'get_filter_multiple',
            page: 'dashboard',
        };

        this.pageJobExecuter(jobName, params, (data) => {
            this.pageData.filterMultiple = this.CH.toJson(data);

            if (typeof nextFunction == 'function') nextFunction(jobName, moreloader, refresher, finalCallback);
        }, moreloader, refresher, finalCallback);
    }

    getAllData(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        const params: any = {
            calls: {
                myHours: {
                    class: "CqCourseLib",
                    function: "get_courses_reports",
                    year: this.pageData.year,
                    return: "hours",
                },
                myCourses: {
                    class: "CqCourseLib",
                    function: "get_my_courses_list",
                    page: 1,
                    length: 5,
                },
                eLearningList: {
                    class: "CqCourseLib",
                    function: "get_e_learning_list",
                    page: 1,
                    length: 5,
                },
                classroomTrainingList: {
                    class: "CqCourseLib",
                    function: "get_classroom_training_list",
                    page: 1,
                    length: 5,
                },
                additionalContents: {
                    class: 'CqLib',
                    function: 'get_contents_additional',
                    content_type: 'mobile',
                },
            },
        };

        // because dashboard calls APIs which need filter multiple, but doesn't have button to select the filter items
        // so system should auto select them all
        this.pageData.filterMultiple.forEach((item) => {
            let bucket: any[] = [];
            item.options.forEach((option) => {
                bucket.push(option.value);
            });
            let bucketTexted = bucket.join(",");

            params.calls.myCourses[item.plural] = bucketTexted;
            params.calls.eLearningList[item.plural] = bucketTexted;
            params.calls.classroomTrainingList[item.plural] = bucketTexted;
        });

        this.pageJobExecuter(jobName, params, (data) => {
            let allData = this.CH.toJson(data);

            // myHours
            let hours = allData.myHours;
            this.pageData.dashHours = this.CH.beautifulNumber(hours.hours.hours);
            this.pageData.dashMinutes = this.CH.beautifulNumber(hours.hours.minutes);

            // myCourses
            this.pageData.myCourses = allData.myCourses;

            // classroomTrainingList
            this.pageData.classroomTrainingList = this.CH.toArray(allData.classroomTrainingList);

            // eLearningList
            this.pageData.eLearningList = this.CH.toArray(allData.eLearningList);

            // additionalContents
            this.pageData.additionalContents = allData.additionalContents;
        }, moreloader, refresher, finalCallback);
    }

    goToAvailableCourses(mediaList): void
    {
        const stateParams: any = {
            media: mediaList == "eLearningList" ? "online" : "offline",
        };
        CoreNavigator.navigateToSitePath('/CqAvailableCourses/index', {
            params: stateParams,
            siteId: this.CH.getSiteId(),
            preferCurrentTab: false,
        });
    }
    goToMyCourses(): void
    {
        const stateParams: any = {
        };
        CoreNavigator.navigateToSitePath('/CqMyCourses/index', {
            params: stateParams,
            siteId: this.CH.getSiteId(),
            preferCurrentTab: false,
        });
    }
}
