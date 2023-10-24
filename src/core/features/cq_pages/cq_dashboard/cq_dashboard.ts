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
        mobileCourseMedia: [],
        userFullName: '',
        dashHours: '00',
        dashMinutes: '00',
        title: '',
    };
    pageJob: any = {
        getCqConfig: {
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

    getCqConfig(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        const params: any = {
            calls: {
                filterMultiple: {
                    cluster: 'CqLib',
                    endpoint: 'get_filter_multiple',
                    page: 'dashboard',
                },
                mobileCourseMedia: {
                    cluster: 'CqLib',
                    endpoint: 'get_cq_config',
                    name: 'mobile_course_media',
                },
            },
        };

        this.pageJobExecuter(jobName, params, (data) => {
            let allData = this.CH.toJson(data);
            this.pageData.filterMultiple = allData.filterMultiple;
            this.pageData.mobileCourseMedia = Array.isArray(allData.mobileCourseMedia[0].value) ? allData.mobileCourseMedia[0].value : [allData.mobileCourseMedia[0].value];
            this.pageData.offlineCourse = this.pageData.mobileCourseMedia.includes("offline");
            this.pageData.onlineCourse = this.pageData.mobileCourseMedia.includes("online");

            if (typeof nextFunction == 'function') nextFunction(jobName, moreloader, refresher, finalCallback);
        }, moreloader, refresher, finalCallback);
    }

    getAllData(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        const params: any = {
            calls: {
                myHours: {
                    cluster: "CqCourseLib",
                    endpoint: "get_courses_reports",
                    year: this.pageData.year,
                    return: "hours",
                },
                myCourses: {
                    cluster: "CqCourseLib",
                    endpoint: "get_my_courses_list",
                    page: 1,
                    length: 5,
                },
                additionalContents: {
                    cluster: 'CqLib',
                    endpoint: 'get_contents_additional',
                    content_type: 'mobile',
                },
            },
        };

        if (this.pageData.offlineCourse)
        {
            params.calls.offline = {
                cluster: "CqCourseLib",
                endpoint: "get_classroom_training_list",
                page: 1,
                length: 5,
                order_by: "rand()",
            };
        }
        if (this.pageData.onlineCourse)
        {
            params.calls.online = {
                cluster: "CqCourseLib",
                endpoint: "get_e_learning_list",
                page: 1,
                length: 5,
                order_by: "rand()",
            };
        }

        // because dashboard calls APIs which need filter multiple, but doesn't have button to select the filter items
        // so system should auto select them all
        this.pageData.filterMultiple.forEach((item) => {
            let bucket: any[] = [];
            item.options.forEach((option) => {
                bucket.push(option.value);
            });
            let bucketTexted = bucket.join(",");

            params.calls.myCourses[item.plural] = bucketTexted;
            if (this.pageData.offlineCourse) params.calls.offline[item.plural] = bucketTexted;
            if (this.pageData.onlineCourse) params.calls.online[item.plural] = bucketTexted;
        });

        this.pageJobExecuter(jobName, params, (data) => {
            let allData = this.CH.toJson(data);
            let temp;

            // myHours
            let hours = allData.myHours;
            this.pageData.dashHours = this.CH.beautifulNumber(hours.hours.hours);
            this.pageData.dashMinutes = this.CH.beautifulNumber(hours.hours.minutes);

            // myCourses
            if (!this.CH.isSame(this.pageData.myCourses, allData.myCourses))
            {
                this.pageData.myCourses = allData.myCourses;
            }

            // offline
            if (this.pageData.offlineCourse)
            {
                temp = this.CH.toArray(allData.offline);
                if (!this.CH.isSame(this.pageData.offline, temp))
                {
                    this.pageData.offline = temp;
                }
            }
            else this.pageData.offline = [];

            // online
            if (this.pageData.onlineCourse)
            {
                temp = this.CH.toArray(allData.online);
                if (!this.CH.isSame(this.pageData.online, temp))
                {
                    this.pageData.online = temp;
                }
            }
            else this.pageData.online = [];

            // additionalContents
            this.pageData.additionalContents = this.CH.toArray(allData.additionalContents);
            this.pageData.hasAdditionalContents = this.pageData.additionalContents.length > 0;
        }, moreloader, refresher, finalCallback);
    }

    goToAvailableCourses(media): void
    {
        const stateParams: any = {
            media,
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

    timeHasCome(data: any, index: number): void
    {
        this.pageData.myCourses[index].willStartIn = -1;
    }
}
