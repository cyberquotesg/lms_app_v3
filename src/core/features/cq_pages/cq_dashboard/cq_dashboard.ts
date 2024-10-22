// done v3

import { Component, ViewChild, Renderer2, OnInit, ElementRef } from '@angular/core';
import { CoreDirectivesRegistry } from '@singletons/directives-registry';
import { CoreCancellablePromise } from '@classes/cancellable-promise';
import { CoreLoadingComponent } from '@components/loading/loading';
import { CoreDom } from '@singletons/dom';
import { Swiper } from 'swiper';
import { SwiperOptions } from 'swiper/types';
import { register } from 'swiper/element/bundle';
import { CoreSwiper } from '@singletons/swiper';
import { CoreNavigator } from '@services/navigator';
import { CqHelper } from '../services/cq_helper';
import { CqPage } from '../classes/cq_page';

register();

@Component({
    selector: 'cq_dashboard',
    templateUrl: './cq_dashboard.html',
    styleUrls: ['cq_dashboard.scss'],
})
export class CqDashboard extends CqPage implements OnInit
{
    protected element: HTMLElement;
    protected domPromise?: CoreCancellablePromise<void>;
    protected pageSlider?: Swiper;
    @ViewChild('swiperRef', { static: true }) set swiperRef(swiperRef: ElementRef) {
        /**
         * This setTimeout waits for Ionic's async initialization to complete.
         * Otherwise, an outdated swiper reference will be used.
         */
        setTimeout(async () => {
            await this.waitLoadingsDone();

            const swiper = CoreSwiper.initSwiperIfAvailable(this.pageSlider, swiperRef, this.sliderOptions);
            if (!swiper) {
                return;
            }

            this.pageSlider = swiper;
        });
    }

    sliderOptions: SwiperOptions = {
        initialSlide: 0,
        speed: 400,
        centerInsufficientSlides: false,
        centeredSlides: false,
        centeredSlidesBounds: false,
        breakpoints: {},
        watchSlidesProgress: true,
    };

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

    constructor(renderer: Renderer2, CH: CqHelper, elementRef: ElementRef)
    {
        super(renderer, CH);

        this.element = elementRef.nativeElement;
    }

    ngOnInit(): void {
        this.usuallyOnInit(() => {
            let userId = this.CH.getUserId();
            this.CH.getUser().getUserFullNameWithDefault(userId).then((userFullName) => {
                this.pageData.userFullName = userFullName;
            });

            this.pageData.year = new Date().getFullYear();

            // setup slide options
            this.pageDefaults.sliderOptions = this.sliderOptions;
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
                cqConfig: {
                    cluster: 'CqLib',
                    endpoint: 'get_cq_config',
                    name: 'mobile_course_media',
                },
            },
        };

        this.pageJobExecuter(jobName, params, (data) => {
            let allData = this.CH.toJson(data);

            // filterMultiple
            this.pageData.filterMultiple = allData.filterMultiple;

            // cqConfig
            var cqConfig: any = {}; allData.cqConfig.forEach((config) => cqConfig[config.name] = config.value);

            this.pageData.mobileCourseMedia = Array.isArray(cqConfig.mobileCourseMedia) ? cqConfig.mobileCourseMedia : [cqConfig.mobileCourseMedia];
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

        if (this.pageData.mobileCourseMedia.includes("offline"))
        {
            params.calls.offline = {
                cluster: "CqCourseLib",
                endpoint: "get_classroom_training_list",
                page: 1,
                length: 5,
            };
        }
        if (this.pageData.mobileCourseMedia.includes("online"))
        {
            params.calls.online = {
                cluster: "CqCourseLib",
                endpoint: "get_e_learning_list",
                page: 1,
                length: 5,
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
            params.calls.online[item.plural] = bucketTexted;
            params.calls.offline[item.plural] = bucketTexted;
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
            if (this.pageData.mobileCourseMedia.includes("offline"))
            {
                temp = this.CH.toArray(allData.offline);
                if (!this.CH.isSame(this.pageData.offline, temp))
                {
                    this.pageData.offline = temp;
                }
            }
            else
            {
                this.pageData.offline = [];
            }

            // online
            if (this.pageData.mobileCourseMedia.includes("online"))
            {
                temp = this.CH.toArray(allData.online);
                if (!this.CH.isSame(this.pageData.online, temp))
                {
                    this.pageData.online = temp;
                }
            }
            else
            {
                this.pageData.online = [];
            }

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

    /**
     * @inheritdoc
     */
    ngOnDestroy(): void {
        this.domPromise?.cancel();
    }

    /**
     * Wait until all <core-loading> children inside the page.
     *
     * @returns Promise resolved when loadings are done.
     */
    protected async waitLoadingsDone(): Promise<void> {
        this.domPromise = CoreDom.waitToBeInDOM(this.element);

        await this.domPromise;

        const page = this.element.closest('.ion-page');
        if (!page) {
            return;
        }

        await CoreDirectivesRegistry.waitDirectivesReady(page, 'core-loading', CoreLoadingComponent);
    }
}
