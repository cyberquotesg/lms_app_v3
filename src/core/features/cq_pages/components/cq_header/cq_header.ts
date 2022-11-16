// (C) Copyright 2021 Cyberquote Indonesia

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { CqHelper } from '../../services/cq_helper';
import { CqComponent } from '../../classes/cq_component';

@Component({
    selector: 'cq_header',
    templateUrl: 'cq_header.html'
})
export class CqHeaderComponent extends CqComponent implements OnInit, OnChanges, OnDestroy {
    @Input() title: string = "";
    @Input() displayMenu: boolean = false;
    @Input() displayNotification: boolean = false;

    @Output() onToggleDrawer: EventEmitter<number>;
    @Output() onGoToNotificationsList: EventEmitter<number>;

    notificationCount = '';

    constructor(CH: CqHelper)
    {
        super(CH);

        this.onToggleDrawer = new EventEmitter();
        this.onGoToNotificationsList = new EventEmitter();
    }

    ngOnInit(): void
    {
        if (this.displayNotification)
        {
            this.notificationCount = this.shortenNotificationCount(this.CH.getNotificationCount());
            // this.events.subscribe('newNotificationCount', (notificationCount) => {
            //   this.notificationCount = this.shortenNotificationCount(notificationCount);
            // });
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
            // this.events.unsubscribe('newNotificationCount');
        }
    }

    shortenNotificationCount(count: number): string
    {
        if (count == 0)
        {
            return '';
        }
        else if (count <= 999)
        {
            return String(count);
        }
        else if (count <= 9999)
        {
            count = Math.floor(count / 100) / 10;
            return String(count) + 'K';
        }
        else if (count <= 999999)
        {
            count = Math.floor(count / 1000);
            return String(count) + 'K';
        }
        else if (count <= 9999999)
        {
            count = Math.floor(count / 100000) / 10;
            return String(count) + 'M';
        }
        else
        {
            count = Math.floor(count / 1000000);
            return String(count) + 'M';
        }
    }

    toggleDrawer(): void
    {
        this.onToggleDrawer.emit();
    }
    goToNotificationsList(): void
    {
        this.onGoToNotificationsList.emit();
    }
}
