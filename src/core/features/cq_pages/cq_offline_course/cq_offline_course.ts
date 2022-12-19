// done v3

import { Component, ViewChild, Renderer2, OnInit } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { CqHelper } from '../services/cq_helper';
import { CqPage } from '../classes/cq_page';
import { ChartData } from 'chart.js';

@Component({
    selector: 'cq_offline_course',
    templateUrl: './cq_offline_course.html',
    styles: ['./cq_offline_course.scss'],
})
export class CqOfflineCourse extends CqPage implements OnInit
{
    @ViewChild('pageSlider', { static: true }) private pageSlider: IonSlides;

    pageParams: any = {
        courseId: 0,
        courseName: '',
    };
    pageDefaults: any = {
    };
    pageJob: any = {
        getCqConfig: 0,
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

    getCqConfig(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        const params: any = {
            calls: {
                courseTypes: {
                    class: 'CqCourseLib',
                    function: 'get_course_type_of_user',
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






            

            if (typeof nextFunction == 'function') nextFunction(jobName, moreloader, refresher, finalCallback);
        }, moreloader, refresher, finalCallback);
    }
}
