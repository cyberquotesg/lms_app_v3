// done v3

import { Component, ViewChild, Renderer2, OnInit } from '@angular/core';
import { IonSlides, Platform } from '@ionic/angular';
import { CqHelper } from '../services/cq_helper';
import { CqPage } from '../classes/cq_page';
import { CoreNavigationOptions, CoreNavigator } from '@services/navigator';
import { CqChecklogBannerComponent } from '../components/cq_checklog_banner/cq_checklog_banner';
import { CoreUtils } from '@services/utils/utils';

@Component({
    selector: 'cq_announcement',
    templateUrl: './cq_announcement.html',
})
export class CqAnnouncement extends CqPage implements OnInit
{
    pageParams: any = {
    };
    pageDefaults: any = {
    };
    pageJob: any = {
    };

    private agent: any;
    private loading: any = false;

    constructor(renderer: Renderer2, CH: CqHelper, platform: Platform)
    {
        super(renderer, CH);
    }

    ngOnInit(): void { this.usuallyOnInit(); }
    ionViewWillEnter(): void { this.usuallyOnViewWillEnter(); }
    ionViewDidEnter(): void { this.usuallyOnViewDidEnter(); }
    ionViewWillLeave(): void { this.usuallyOnViewWillLeave(); }
    ionViewDidLeave(): void { this.usuallyOnViewDidLeave(); }






}
