import { Component, OnInit, Optional } from '@angular/core';
import { CoreCourseContentsPage } from '@features/course/pages/contents/contents';
import { StatusBar } from '@singletons';
import { AddonModPageIndexComponent as Old } from './index';

@Component({
    selector: 'addon-mod-page-index',
    templateUrl: 'addon-mod-page-index.new.html',
    styleUrls: ['index.scss'],
})
export class AddonModPageIndexComponent extends Old implements OnInit
{
    isFullscreen = false;

    constructor(@Optional() courseContentsPage?: CoreCourseContentsPage) {
        super(courseContentsPage);
    }

    /**
     * @inheritdoc
     */
    async ngOnInit(): Promise<void> {
        super.ngOnInit();
    }

    manageFullscreen(): void
    {
        this.isFullscreen = !this.isFullscreen;

        this.isFullscreen ? StatusBar.hide() : StatusBar.show();
        document.body.classList.toggle('core-iframe-fullscreen', this.isFullscreen);
        document.getElementById("main-wrapper")!.classList.toggle('is-fullscreen', this.isFullscreen);
    }
}
