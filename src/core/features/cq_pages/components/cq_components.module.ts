import { NgModule } from '@angular/core';
import { CoreSharedModule } from '@/core/shared.module';
import { CoreMainMenuUserMenuComponent } from '@/core/features/mainmenu/components/user-menu/user-menu';
import { CoreMainMenuUserButtonComponent } from '@features/mainmenu/components/user-menu-button/user-menu-button';
import { CoreMainMenuUserMenuTourComponent } from '@features/mainmenu/components/user-menu-tour/user-menu-tour';
import { CqItemsComponent } from './cq_items/cq_items';
import { CqHeaderComponent } from './cq_header/cq_header';
import { CqEmptyComponent } from './cq_empty/cq_empty';
import { CqFilterComponent } from './cq_filter/cq_filter';
import { CqFilterComponentModal } from './cq_filter/cq_filter_modal';
import { CqChartComponent } from './cq_chart/cq_chart';
import { CqTagsComponent } from './cq_tags/cq_tags';
import { CqWillStartInComponent } from './cq_will_start_in/cq_will_start_in';
import { CqChecklogBannerComponent } from './cq_checklog_banner/cq_checklog_banner';

@NgModule({
    declarations: [
        CqItemsComponent,
        CqHeaderComponent,
        CqEmptyComponent,
        CqFilterComponent,
        CqFilterComponentModal,
        CqChartComponent,
        CqTagsComponent,
        CqWillStartInComponent,
        CqChecklogBannerComponent,
    ],
    imports: [
        CoreSharedModule,
        CoreMainMenuUserMenuComponent,
        CoreMainMenuUserButtonComponent,
        CoreMainMenuUserMenuTourComponent,
    ],
    exports: [
        CqItemsComponent,
        CqHeaderComponent,
        CqEmptyComponent,
        CqFilterComponent,
        CqFilterComponentModal,
        CqChartComponent,
        CqTagsComponent,
        CqWillStartInComponent,
        CqChecklogBannerComponent,
    ],
})
export class CqComponentsModule {}
