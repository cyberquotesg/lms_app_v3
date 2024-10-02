// (C) Copyright 2021 Cyberquote Indonesia

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { CqHelper } from '../../services/cq_helper';
import { CqComponent } from '../../classes/cq_component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'cq_header',
    templateUrl: 'cq_header.html'
})
export class CqHeaderComponent extends CqComponent implements OnInit, OnChanges, OnDestroy {
    @Input() title: string = "";
    @Input() displayMenu: boolean = false;
    @Input() displayNotification: boolean = false;
    @Input() displayUserMenu: boolean = false;
    @Input() displayProgress: boolean = false;

    number = "0";
    notificationSubscription?: Subscription;
    announcementSubscription?: Subscription;

    constructor(CH: CqHelper)
    {
        super(CH);
    }

    ngOnInit(): void
    {
        if (this.displayNotification)
        {
            this.notificationSubscription = this.CH.notificationNumber.subscribe((notificationCount) => {
                // this.announcementSubscription = this.CH.announcementNumber.subscribe((announcementCount) => {
                    let value = Number(notificationCount)/* + Number(announcementCount)*/;
                    this.number = this.CH.shortenNotificationCount(value);
                // });
            });
        }
    }
    ngOnChanges(changes: SimpleChanges): void
    {
        this.implementChanges(changes);
    }
    ngOnDestroy(): void
    {
        if (this.displayNotification)
        {
            this.notificationSubscription.unsubscribe();
            // this.announcementSubscription.unsubscribe();
        }
    }
}
