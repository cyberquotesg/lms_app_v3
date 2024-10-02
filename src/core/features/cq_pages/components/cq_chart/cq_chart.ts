// (C) Copyright 2021 Cyberquote Indonesia

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, SimpleChange, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CqHelper } from '../../services/cq_helper';
import { CqComponent } from '../../classes/cq_component';
import { Chart, ChartData, ChartOptions } from 'chart.js';

@Component({
    selector: 'cq_chart',
    templateUrl: 'cq_chart.html'
})
export class CqChartComponent extends CqComponent implements OnInit, OnChanges, AfterViewInit {
    @Input() type?: string;
    @Input() stacked?: boolean;
    @Input() lineTension?: number;
    @Input() data?: ChartData;
    @ViewChild('cqChart') cqChart?: ElementRef;

    chart?: Chart;
    inited: boolean = false;

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

        let chartDataIsSame = false;

        // if this is working with data, do more check
        if (changes.data)
        {
            let oldData: string = "";
            if (changes.data.previousValue)
            {
                for (let dataset of changes.data.previousValue.datasets) if (dataset._meta) delete dataset._meta;
                oldData = JSON.stringify(changes.data.previousValue.datasets);
            }

            let newData: string = "";
            if (changes.data.currentValue)
            {
                for (let dataset of changes.data.currentValue.datasets) if (dataset._meta) delete dataset._meta;
                newData = JSON.stringify(changes.data.currentValue.datasets);
            }

            chartDataIsSame = oldData === newData;
        }

        if (this.inited)
        {
            if (chartDataIsSame) this.CH.log("chartData is same, no need to regenerate chart");
            else this.generateChart();
        }
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
        let options: ChartOptions = {
            responsive: true,
            elements: {
                line: {
                    tension: this.lineTension || 0,
                },
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
                    stacked: true,
                }],
                yAxes: [{
                    stacked: true,
                }],
            };
        }
        this.chart = new Chart(this.cqChart.nativeElement, {
            type: this.type || "line",
            data: this.data,
            options: options,
        });
        this.inited = true;
    }
}
