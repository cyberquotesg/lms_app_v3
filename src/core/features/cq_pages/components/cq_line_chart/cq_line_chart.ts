// (C) Copyright 2021 Cyberquote Indonesia

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, SimpleChange, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CqHelper } from '../../services/cq_helper';
import { CqComponent } from '../../classes/cq_component';
import { Chart, ChartData } from 'chart.js';

@Component({
    selector: 'cq_line_chart',
    templateUrl: 'cq_line_chart.html'
})
export class CqLineChartComponent extends CqComponent implements OnInit, OnChanges, AfterViewInit {
    @Input() data: ChartData;
    @ViewChild('cqLineChart') cqLineChart: ElementRef;

    private chart: Chart;

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
        this.chart = new Chart(this.cqLineChart.nativeElement, {
            type: 'line',
            data: this.data,
            options: {
                responsive: true,
                elements: {
                    line: {
                        tension: 0
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
            },
        });
    }
}
