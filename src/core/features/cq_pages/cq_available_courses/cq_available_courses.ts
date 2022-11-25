// done v3

import { Component, ViewChild, Renderer2, OnInit } from '@angular/core';
import { IonSlides } from '@ionic/angular';
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
    @ViewChild('pageSlider', { static: true }) private pageSlider: IonSlides;

    pageParams = {
    };
    pageDefaults: any = {
        medias: ["online", "offline"],
        media: "online",
        online: {
            initiated: false,
            courses: [],
            filterMultiple: [],
            filterAgent: null,
            filterText: "",
        },
        offline: {
            initiated: false,
            courses: [],
            filterMultiple: [],
            filterAgent: null,
            filterText: "",
        },
    };
    pageJob: any = {
        filterMultiple: 0,
        courses: 0,
    };
    // warning! harus bisa bedain online dan offline
    pageJobLoadMore: any = {
        courses: 0,
    };

    constructor(renderer: Renderer2, CH: CqHelper)
    {
        super(renderer, CH);

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
        if (this.pageData.media == "online")
        {
            // warning! modeData itu bisa bingung antara dua slide
            const params: any = {
                class: "CqCourseLib",
                function: "get_e_learning_list",
                page: modeData.page,
                length: modeData.length,
                search: this.pageData.online.filterText,
            };

            this.pageJobExecuter(jobName, params, (data) => {
                let courses = this.CH.toArray(this.CH.toJson(data));
                this.pageData.online.initiated = true;
                this.pageData.online.reachedEndOfList = this.reachedEndOfList = this.CH.isEmpty(courses) || this.CH.getLength(courses) < modeData.length;

                if (modeData.mode != 'loadmore') this.pageData.online.courses = courses;
                else this.pageData.courses = this.pageData.online.courses.concat(courses);

                if (typeof nextFunction == 'function') nextFunction(jobName, moreloader, refresher, finalCallback);
            }, moreloader, refresher, finalCallback);
        }
        else if (this.pageData.media == "offline")
        {
            // warning! modeData itu bisa bingung antara dua slide
            const params: any = {
                class: "CqCourseLib",
                function: "get_classroom_training_list",
                page: modeData.page,
                length: modeData.length,
                search: this.pageData.offline.filterText,
            };

            this.pageJobExecuter(jobName, params, (data) => {
                let courses = this.CH.toArray(this.CH.toJson(data));
                this.pageData.offline.initiated = true;
                this.pageData.offline.reachedEndOfList = this.reachedEndOfList = this.CH.isEmpty(courses) || this.CH.getLength(courses) < modeData.length;

                // aditional information
                for (let id in courses)
                {
                    courses[id].letter = courses[id].name.substr(0, 1);
                    courses[id].venue = courses[id].venue ? courses[id].venue : '-';
                    courses[id].media = 'offline';
                }

                if (modeData.mode != 'loadmore') this.pageData.offline.courses = courses;
                else this.pageData.courses = this.pageData.offline.courses.concat(courses);

                if (typeof nextFunction == 'function') nextFunction(jobName, moreloader, refresher, finalCallback);
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
                else this.CH.log('final data', this.pageData);
            });
        }
    }
    onFilterChange(data: any): void
    {
        this.pageIsLoading = true;
        clearTimeout(this.pageData[this.pageData.media].filterAgent);
        let locaAgent = this.pageData[this.pageData.media].filterAgent = setTimeout(() => {
            let text = data.text.trim().toLowerCase();

            if (locaAgent != this.pageData[this.pageData.media].filterAgent || text == this.pageData[this.pageData.media].filterText)
            {
                this.pageIsLoading = false;
                return;
            }

            this.pageData[this.pageData.media].filterText = data.text;
            this.pageForceReferesh();
        }, 1000);
    }
}
