// done v3

import { Component, ViewChild, Renderer2, OnInit } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError} from '@angular/router';
import { IonSlides } from '@ionic/angular';
import { CqHelper } from '../services/cq_helper';
import { CqPage } from '../classes/cq_page';

@Component({
    selector: 'cq_available_courses',
    templateUrl: './cq_available_courses.html',
    styles: ['cq_available_courses.scss'],
})
export class CqAvailableCourses extends CqPage implements OnInit
{
    @ViewChild('pageSlider', { static: true }) private pageSlider: IonSlides;

    pageParams: any = {
        media: "online",
    };
    pageDefaults: any = {
        medias: ["online", "offline"],
        online: {
            initiated: false,
            reachedEndOfList: false,
            courses: [],
            filterMultiple: [],
            filterAgent: null,
            filterText: "",
            page: this.page,
            length: this.length,
        },
        offline: {
            initiated: false,
            reachedEndOfList: false,
            courses: [],
            filterMultiple: [],
            filterAgent: null,
            filterText: "",
            page: this.page,
            length: this.length,
        },
    };
    pageJob: any = {
        filterMultiple: {
            value: 0,
            next: {
                courses: 0,
            },
        },
    };
    pageJobLoadMore: any = {
        courses: 0,
    };
    pageJobRefresh: any = {
        courses: 0,
    };

    constructor(renderer: Renderer2, CH: CqHelper, private router: Router)
    {
        super(renderer, CH);

        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationStart || event instanceof NavigationEnd)
            {
                this.CH.log("navigation change", event);
                let url = event.url.split("?");

                // is this for CqAvailableCourses?
                if (url[0].indexOf("/CqAvailableCourses/") == -1) return;

                // does it have query?
                if (!url[1]) return;

                // is the query media?
                let query = url[1].split("=");
                if (query[0] != "media") return;

                // seems fine, use it
                this.selectMedia(query[1]);
            }
        });
    }

    ngOnInit(): void
    {
        this.usuallyOnInit(() => {
            this.pageData.media = this.pageParams.media;
            this.pageData.sliderOptions = {
                initialSlide: this.pageParams.media == "online" ? 0 : 1,
                speed: 400,
                centerInsufficientSlides: true,
                centeredSlides: true,
                centeredSlidesBounds: true,
                slidesPerView: 1,
            };
        });
    }
    ionViewWillEnter(): void { this.usuallyOnViewWillEnter(); }
    ionViewDidEnter(): void { this.usuallyOnViewDidEnter(); }
    ionViewWillLeave(): void { this.usuallyOnViewWillLeave(); }
    ionViewDidLeave(): void { this.usuallyOnViewDidLeave(); }

    filterMultiple(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        const params: any = {
            calls: {
                onlineFilter: {
                    class: 'CqLib',
                    function: 'get_filter_multiple',
                    page: 'e_learning_list',
                },
                offlineFilter: {
                    class: 'CqLib',
                    function: 'get_filter_multiple',
                    page: 'classroom_training_list',
                },
            },
        };

        this.pageJobExecuter(jobName, params, (data) => {
            let allData = this.CH.toJson(data);

            // onlineFilter
            this.pageData.online.filterMultiple = allData.onlineFilter;

            // offlineFilter
            this.pageData.offline.filterMultiple = allData.offlineFilter;

            if (typeof nextFunction == 'function') nextFunction(jobName, moreloader, refresher, finalCallback);
        }, moreloader, refresher, finalCallback);
    }
    courses(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        // don't use modeData.mode, but use it's own duplicated functionality
        let page, length, media = this.pageData.media;
        if (modeData.mode == 'firstload' || modeData.mode == 'forced-firstload')
        {
            this.pageData[media].page = 1;
            page = this.pageData[media].page;
            length = this.pageData[media].length;
        }
        else if (modeData.mode == 'loadmore' || modeData.mode == 'forced-loadmore')
        {
            this.pageData[media].page++;
            page = this.pageData[media].page;
            length = this.pageData[media].length;
        }
        else if (modeData.mode == 'refresh' || modeData.mode == 'forced-refresh')
        {
            page = 1;
            length = this.pageData[media].page * this.pageData[media].length;
        }
        else
        {
            page = this.pageData[media].page;
            length = this.pageData[media].length;
        }

        if (media == "online")
        {
            const params: any = {
                class: "CqCourseLib",
                function: "get_e_learning_list",
                page: page,
                length: length,
                search: this.pageData.online.filterText,
            };
            this.pageData.online.filterMultiple.forEach((item) => {
                let bucket: any[] = [];
                item.options.forEach((option) => {
                    if (option.selected) bucket.push(option.value);
                });
                params[item.plural] = bucket.join(",");
            });

            this.pageJobExecuter(jobName, params, (data) => {
                let courses = this.CH.toArray(this.CH.toJson(data));
                this.pageData.online.initiated = true;
                this.pageData.online.reachedEndOfList = this.CH.isEmpty(courses) || this.CH.getLength(courses) < this.pageData.online.length;

                if (modeData.mode != 'loadmore' && modeData.mode != 'forced-loadmore') this.pageData.online.courses = courses;
                else this.pageData.online.courses = this.pageData.online.courses.concat(courses);

                if (typeof nextFunction == 'function') nextFunction(jobName, moreloader, refresher, finalCallback);

                this.adjustScreenHeight(".page-slider-cqac");
            }, moreloader, refresher, finalCallback);
        }
        else if (media == "offline")
        {
            const params: any = {
                class: "CqCourseLib",
                function: "get_classroom_training_list",
                page: page,
                length: length,
                search: this.pageData.offline.filterText,
            };
            this.pageData.offline.filterMultiple.forEach((item) => {
                let bucket: any[] = [];
                item.options.forEach((option) => {
                    if (option.selected) bucket.push(option.value);
                });
                params[item.plural] = bucket.join(",");
            });

            this.pageJobExecuter(jobName, params, (data) => {
                let courses = this.CH.toArray(this.CH.toJson(data));
                this.pageData.offline.initiated = true;
                this.pageData.offline.reachedEndOfList = this.CH.isEmpty(courses) || this.CH.getLength(courses) < this.pageData.offline.length;

                // aditional information
                for (let id in courses)
                {
                    courses[id].letter = courses[id].name.substr(0, 1);
                    courses[id].venue = courses[id].venue ? courses[id].venue : '-';
                    courses[id].media = 'offline';
                }

                if (modeData.mode != 'loadmore' && modeData.mode != 'forced-loadmore') this.pageData.offline.courses = courses;
                else this.pageData.offline.courses = this.pageData.offline.courses.concat(courses);

                if (typeof nextFunction == 'function') nextFunction(jobName, moreloader, refresher, finalCallback);

                this.adjustScreenHeight(".page-slider-cqac");
            }, moreloader, refresher, finalCallback);
        }
    }

    selectMedia(media): void
    {
        if (this.pageData.media != media)
        {
            this.pageData.media = media;
            let mediaIndex = this.pageData.medias.indexOf(this.pageData.media);
            this.pageSlider.slideTo(mediaIndex);
            if (!this.pageData[this.pageData.media].initiated) this.pageForceReferesh();
        }
    }
    pageSliderChange(): void
    {
        if (this.pageStatus)
        {
            this.pageSlider.getActiveIndex().then((index) => {
                this.pageData.media = this.pageData.medias[index];
                if (!this.pageData[this.pageData.media].initiated) this.pageForceReferesh();
                else
                {
                    this.adjustScreenHeight(".page-slider-cqac");
                    this.CH.log('final data', this.pageData);
                }
            });
        }
        else
        {
            this.adjustScreenHeight(".page-slider-cqac");
        }
    }
    onFilterChange(data: any): void
    {
        let media = this.pageData.media;
        this.pageIsLoading = true;
        clearTimeout(this.pageData[media].filterAgent);
        let locaAgent = this.pageData[media].filterAgent = setTimeout(() => {
            if (locaAgent != this.pageData[media].filterAgent)
            {
                this.CH.log("filter rejected: agent is different");

                this.pageIsLoading = false;
                return;
            }

            let newText = data.text.trim().toLowerCase();
            let textIsSame = newText == this.pageData[media].filterText;

            let newMultiple = this.CH.cloneJson(data.filterMultiple);
            let multipleIsSame = true;
            for (let i in newMultiple)
            {
                for (let o in newMultiple[i].options)
                {
                    if (newMultiple[i].options[o].selected != this.pageData[media].filterMultiple[i].options[o].selected)
                    {
                        multipleIsSame = false;
                        break;
                    }
                }

                if (!multipleIsSame) break;
            }

            if (textIsSame && multipleIsSame)
            {
                this.CH.log("filter rejected: textIsSame", textIsSame);
                this.CH.log("filter rejected: multipleIsSame", multipleIsSame);

                this.pageIsLoading = false;
                return;
            }

            this.pageData[media].filterText = newText;
            this.pageData[media].filterMultiple = newMultiple;
            this.pageData[media].page = 1;
            this.pageForceReferesh();
        }, 1000);
    }
}
