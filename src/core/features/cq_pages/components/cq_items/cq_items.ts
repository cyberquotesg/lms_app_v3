// (C) Copyright 2021 Cyberquote Indonesia

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { CqHelper } from '../../services/cq_helper';
import { CqComponent } from '../../classes/cq_component';

@Component({
    selector: 'cq_items',
    templateUrl: 'cq_items.html'
})
export class CqItemsComponent extends CqComponent implements OnInit, OnChanges {
    @Input() items: any | any[] = [];
    @Input() type: string = "tile";
    @Input() hideTags: boolean = false;
    @Output() onSelectItem: EventEmitter<number>;

    showFakeItems: boolean = false;

    constructor(CH: CqHelper)
    {
        super(CH);
        
        this.onSelectItem = new EventEmitter();
        this.prepareItems();
    }

    ngOnInit(): void
    {
        this.prepareItems();
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
            this.items = [this.items];
            this.showFakeItems = false;
        }
        else
        {
            this.showFakeItems = true;
        }

        // adjust the properties
        this.items.forEach((item) => {
            item.title = item.title || item.subject || item.name || item.displayname || item.fullname_trimmed || item.fullnameTrimmed || item.fullname || item.shortname || "";
            item.letter = this.CH.getLetter(item.title) || "";
            item.subTitle = (item.subTitle || item.description || item.summary || item.smallmessage || item.timecreated || "").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">");
            item.image = item.image || item.course_image_full || item.courseImageFull || item.course_image || item.courseImage ||  item.thumbnail || item.iconurl || item.profileimageurlfrom || null;

            if (item.has_finished || item.hasFinished)
            {
                item.show_enrolled = false;
                item.show_finished = true;
            }
            else
            {
                item.show_enrolled = item.has_enrolled || item.hasEnrolled;
                item.show_finished = false;
            }
        });
    }

    selectItem(item: any): void
    {
        this.onSelectItem.emit(item);
    }
}
