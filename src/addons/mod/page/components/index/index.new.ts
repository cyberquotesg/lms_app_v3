import { AddonModPageIndexComponent as Old } from './index';
import { StatusBar } from '@singletons';

@Component({
    selector: 'addon-mod-page-index-new',
    templateUrl: 'addon-mod-page-index.new.html',
    styleUrls: ['index.scss'],
})
export class AddonModPageIndexComponent extends Old
{
    isFullscreen = false;

    constructor(@Optional() courseContentsPage?: CoreCourseContentsPage) {
        super(courseContentsPage);
    }

    manageFullscreen(): void
    {
        this.isFullscreen = !this.isFullscreen;

        this.isFullscreen ? StatusBar.hide() : StatusBar.show();
        document.body.classList.toggle('core-iframe-fullscreen', this.isFullscreen);
        document.getElementById("main-wrapper")!.classList.toggle('is-fullscreen', this.isFullscreen);
    }
}
