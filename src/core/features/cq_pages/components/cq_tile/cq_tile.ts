// (C) Copyright 2021 Cyberquote Indonesia

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { CqHelper } from '../../services/cq_helper';
import { CqComponent } from '../../classes/cq_component';

@Component({
    selector: 'cq_tile',
    templateUrl: 'cq_tile.html'
})
export class CqTileComponent extends CqComponent implements OnInit, OnChanges {
    @Input() items: any | any[] = [];
    @Output() onSelectItem: EventEmitter<number>;

    constructor(CH: CqHelper)
    {
        super(CH);
        
        this.onSelectItem = new EventEmitter();
        this.prepareItems();
    }

    ngOnInit(): void
    {
    }
    ngOnChanges(changes: SimpleChanges): void
    {
        this.implementChanges(changes);
        this.prepareItems();
    }

    prepareItems(): void
    {
        // initial checks
        if (!Array.isArray(this.items))
        {
            // empty thing, skip
            if (!this.items) return;

            // make sure it is array
            else this.items = [this.items];
        }

        // adjust the properties
        this.items.forEach((item) => {
            item.title = item.title || item.subject || item.name || item.displayname || item.fullname || item.shortname;
            item.letter = this.CH.getLetter(item.title);
            item.description = item.description || item.summary || item.smallmessage;
            item.course_image = item.course_image || item.course_image_full;

            if (item.is_user_finished && item.is_user_finished == '1')
            {
                item.show_enrolled = false;
                item.show_finished = true;
            }
            else
            {
                item.show_enrolled = item.is_user_enrolled && item.is_user_enrolled == '1';
                item.show_finished = false;
            }
        });
    }

    selectItem(item: any): void
    {
        this.onSelectItem.emit(item);
    }
}
