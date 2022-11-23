// (C) Copyright 2021 Cyberquote Indonesia

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, SimpleChange, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CqHelper } from '../../services/cq_helper';
import { CqComponent } from '../../classes/cq_component';
import { Chart, ChartData } from 'chart.js';

@Component({
    selector: 'cq_chart',
    templateUrl: 'cq_chart.html'
})
export class CqChartComponent extends CqComponent implements OnInit, OnChanges, AfterViewInit {
    @Input() type: string;
    @Input() stacked: boolean;
    @Input() data: ChartData;
    @ViewChild('cqChart') cqChart: ElementRef;

    private chart: Chart;
    private inited: boolean = false;

    constructor(CH: CqHelper)
    {
        super(CH);
    }

    ngOnInit(): void
    {
    }
    ngOnChanges(changes: SimpleChanges): void
    {
        this.implementChanges(changes);
        if (this.inited) this.generateChart();
    }

    ngAfterViewInit(): void
    {
        /* *a/
        data: {
            labels: [
                'Jan', 'Feb', 'Mar',
                'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep',
                'Oct', 'Nov', 'Dec',
            ],
            datasets: [
                {
                    label: 'Core CPD',
                    data: [
                        {x: 1, y: 0}, {x: 2, y: 3}, {x: 3, y: 3},
                        {x: 4, y: 4}, {x: 5, y: 4}, {x: 6, y: 7},
                        {x: 7, y: 10}, {x: 8, y: 10}, {x: 9, y: 10},
                        {x: 10, y: 12}, {x: 11, y: 18}, {x: 12, y: 21},
                    ],
                    fill: false,
                    borderColor: #ff0000,
                    backgroundColor: #ff0000,
                },
                {
                    label: 'Supplementary CPD',
                    data: [
                        {x: 1, y: 0}, {x: 2, y: 3}, {x: 3, y: 3},
                        {x: 4, y: 4}, {x: 5, y: 4}, {x: 6, y: 7},
                        {x: 7, y: 10}, {x: 8, y: 10}, {x: 9, y: 10},
                        {x: 10, y: 12}, {x: 11, y: 18}, {x: 12, y: 21},
                    ],
                    fill: false,
                    borderColor: #ff0000,
                    backgroundColor: #ff0000,
                },
                {
                    label: 'General Insurance CPD',
                    data: [
                        {x: 1, y: 0}, {x: 2, y: 3}, {x: 3, y: 3},
                        {x: 4, y: 4}, {x: 5, y: 4}, {x: 6, y: 7},
                        {x: 7, y: 10}, {x: 8, y: 10}, {x: 9, y: 10},
                        {x: 10, y: 12}, {x: 11, y: 18}, {x: 12, y: 21},
                    ],
                    fill: false,
                    borderColor: #ff0000,
                    backgroundColor: #ff0000,
                },
            ],
        };
        /* */
        this.generateChart();
    }

    generateChart(): void
    {
        let options = {
            responsive: true,
            elements: {
                line: {
                    tension: 0.3
                }
            },
            maintainAspectRatio: false,
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    boxWidth: 20,
                },
            },
            scales: {},
        };
        
        if (this.stacked)
        {
            options.scales = {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true
                }]
            };
        }
        this.chart = new Chart(this.cqChart.nativeElement, {
            type: this.type,
            data: this.data,
            options: options,
        });
        this.inited = true;
    }
}
