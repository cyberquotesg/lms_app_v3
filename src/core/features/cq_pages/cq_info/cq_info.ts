// done v3

import { Component, ViewChild, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { IonSlides, Platform } from '@ionic/angular';
import { CqHelper } from '../services/cq_helper';
import { CqPage } from '../classes/cq_page';
import { CoreNavigationOptions, CoreNavigator } from '@services/navigator';
import { CqChecklogBannerComponent } from '../components/cq_checklog_banner/cq_checklog_banner';
import { CoreUtils } from '@services/utils/utils';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { File } from '@ionic-native/file/ngx';

@Component({
    selector: 'cq_info',
    templateUrl: './cq_info.html',
})
export class CqInfo extends CqPage implements OnInit, OnDestroy
{
    @ViewChild('pageSlider', { static: true }) private pageSlider: IonSlides;

    pageParams: any = {
    };
    pageDefaults: any = {
        subject: 'Notification',
        selectedOne: 'notification',
    };
    pageJob: any = {
        getData: 0,
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

    ngOnDestroy(): void
    {
    }

    getData(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        this.pageJobImitator(jobName, {}, (data) => {

            this.pageData.notificationList = "hei n";
            this.pageData.announcementList = "hei a";

            if (typeof nextFunction == 'function') nextFunction(jobName, moreloader, refresher, finalCallback);
        }, moreloader, refresher, finalCallback);
    }

    selectOne(target: string): void
    {
        if (this.pageData.selectedOne != target)
        {
            this.pageData.selectedOne = target;
            this.pageData.subject = this.CH.capitalize(this.pageData.selectedOne);
            let index = target == "notification" ? 0 : 1;
            this.pageSlider.slideTo(index);
        }
    }
    pageSliderChange(): void
    {
        if (this.pageStatus)
        {
            this.pageSlider.getActiveIndex().then((index) => {
                this.pageData.selectedOne = index ? "announcement" : "notification";
                this.pageData.subject = this.CH.capitalize(this.pageData.selectedOne);
            });
        }
    }
}
