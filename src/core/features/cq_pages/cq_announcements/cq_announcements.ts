// done v3

import { Component, ViewChild, Renderer2, OnInit } from '@angular/core';
import { IonSlides, Platform } from '@ionic/angular';
import { CqHelper } from '../services/cq_helper';
import { CqPage } from '../classes/cq_page';
import { CoreNavigationOptions, CoreNavigator } from '@services/navigator';
import { CqChecklogBannerComponent } from '../components/cq_checklog_banner/cq_checklog_banner';
import { CoreUtils } from '@services/utils/utils';

@Component({
    selector: 'cq_announcements',
    templateUrl: './cq_announcements.old.html',
})
export class CqAnnouncements extends CqPage implements OnInit
{
    pageParams: any = {
    };
    pageDefaults: any = {
        announcements: [],
        filterAgent: null,
        filterText: "",
        reachedEndOfList: false,
        page: this.page,
        length: this.length,
    };
    pageJob: any = {
        announcements: 0,
    };

    private agent: any;
    loading: any = false;
    showItems: boolean = true;

    constructor(renderer: Renderer2, CH: CqHelper, platform: Platform)
    {
        super(renderer, CH);
    }

    ngOnInit(): void { this.usuallyOnInit(); }
    ionViewWillEnter(): void {
        setTimeout(() => this.showItems = false);
        setTimeout(() => this.showItems = true);
        this.usuallyOnViewWillEnter();
    }
    ionViewDidEnter(): void { this.usuallyOnViewDidEnter(); }
    ionViewWillLeave(): void { this.usuallyOnViewWillLeave(); }
    ionViewDidLeave(): void { this.usuallyOnViewDidLeave(); }

    announcements(jobName: string, moreloader?: any, refresher?: any, modeData?: any, nextFunction?: any, finalCallback?: any): void
    {
        // don't use modeData.mode, but use it's own duplicated functionality
        let page, length;
        if (modeData.mode == 'firstload' || modeData.mode == 'forced-firstload')
        {
            this.pageData.page = 1;
            page = this.pageData.page;
            length = this.pageData.length;
        }
        else if (modeData.mode == 'loadmore' || modeData.mode == 'forced-loadmore')
        {
            this.pageData.page++;
            page = this.pageData.page;
            length = this.pageData.length;
        }
        else if (modeData.mode == 'refresh' || modeData.mode == 'forced-refresh')
        {
            page = 1;
            length = this.pageData.page * this.pageData.length;
        }
        else
        {
            page = this.pageData.page;
            length = this.pageData.length;
        }

        const params: any = {
            class: "CqLib",
            function: "get_announcements",
            page: page,
            length: length,
            search: this.pageData.filterText ? this.pageData.filterText : null,
        };
        this.pageJobExecuter(jobName, params, (data) => {
            let announcements = this.CH.toArray(this.CH.toJson(data));
            this.reachedEndOfList = this.CH.isEmpty(announcements) || this.CH.getLength(announcements) < modeData.length;

            if (modeData.mode != 'loadmore' && modeData.mode != 'forced-loadmore') this.pageData.announcements = announcements;
            else this.pageData.announcements = this.pageData.announcements.concat(announcements);

            if (typeof nextFunction == 'function') nextFunction(jobName, moreloader, refresher, finalCallback);
        }, moreloader, refresher, finalCallback);
    }

    openAnnouncement(item: any): void
    {
        for (let announcement of this.pageData.announcements)
        {
            if (announcement.id == item.id)
            {
                item.read = true;
                item.tags = [];
                break;
            }
        }

        const stateParams: any = {
            discussion_id: item.id,
        };
        CoreNavigator.navigateToSitePath('/CqAnnouncement/index', {
            params: stateParams,
            preferCurrentTab: false,
        });
    }

    onFilterChange(data: any): void
    {
        this.pageIsLoading = true;
        clearTimeout(this.pageData.filterAgent);
        let locaAgent = this.pageData.filterAgent = setTimeout(() => {
            if (locaAgent != this.pageData.filterAgent)
            {
                this.CH.log("filter rejected: agent is different");

                this.pageIsLoading = false;
                return;
            }

            let newText = data.text.trim().toLowerCase();
            let textIsSame = newText == this.pageData.filterText;

            if (textIsSame)
            {
                this.CH.log("filter rejected: textIsSame", textIsSame);

                this.pageIsLoading = false;
                return;
            }

            this.pageData.filterText = newText;
            this.pageForceReferesh();
        }, 1000);
    }
}
