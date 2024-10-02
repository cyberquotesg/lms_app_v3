// (C) Copyright 2021 Cyberquote Indonesia

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { CqHelper } from '../../services/cq_helper';
import { CqComponent } from '../../classes/cq_component';

@Component({
    selector: 'cq_will_start_in',
    templateUrl: 'cq_will_start_in.html'
})
export class CqWillStartInComponent extends CqComponent implements OnInit, OnChanges {
    @Input() unixtimestamp?: number;
    @Input() animation?: boolean;
    @Input() big?: boolean;
    @Output() onZero?: EventEmitter<any>;

    agent?: any;
    startInDays?: number;
    startInHours?: number;
    startInMinutes?: number;
    startInSeconds?: number;
    willStartIn?: number;
    timeUrgency?: number;
    bigClass?: string;
    focusOn?: string;

    constructor(CH: CqHelper)
    {
        super(CH);

        this.onZero = new EventEmitter();
    }

    ngOnInit(): void
    {
        this.prepare();
    }
    ngOnChanges(changes: SimpleChanges): void
    {
        this.implementChanges(changes);
        this.prepare();
    }

    prepare(): void
    {
        if (this.big) this.bigClass = 'big';
        else this.bigClass = '';

        this.translateTime(this.unixtimestamp);
        if (this.animation)
        {
            clearInterval(this.agent);
            this.agent = setInterval(() => {
                this.unixtimestamp--;
                this.translateTime(this.unixtimestamp);

                if (this.unixtimestamp == 0)
                {
                    let emitData: any = {
                        date: new Date(),
                    };
                    this.CH.log('emit data', emitData);
                    this.onZero.emit(emitData);

                    clearInterval(this.agent);
                }
            }, 1000);
        }
    }
    translateTime(unixtimestamp): void
    {
        let translatedTime = this.CH.translateTime(unixtimestamp);
        this.startInDays = translatedTime.startInDays;
        this.startInHours = translatedTime.startInHours;
        this.startInMinutes = translatedTime.startInMinutes;
        this.startInSeconds = translatedTime.startInSeconds;
        this.willStartIn = translatedTime.will_start_in;
        this.timeUrgency = translatedTime.timeUrgency;

        if (this.startInDays != 0) this.focusOn = 'focus-on-days';
        else if (this.startInHours != 0) this.focusOn = 'focus-on-hours';
        else if (this.startInMinutes != 0)  this.focusOn = 'focus-on-minutes';
        else this.focusOn = 'focus-on-seconds';
    }
}
