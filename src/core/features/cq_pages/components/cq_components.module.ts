import { NgModule } from '@angular/core';
import { CoreSharedModule } from '@/core/shared.module';
import { CoreMainMenuComponentsModule } from '@features/mainmenu/components/components.module';
import { CqTileComponent } from './cq_tile/cq_tile';
import { CqHeaderComponent } from './cq_header/cq_header';
import { CqEmptyComponent } from './cq_empty/cq_empty';
import { CqFilterComponent } from './cq_filter/cq_filter';
import { CqFilterComponentModal } from './cq_filter/cq_filter_modal';
import { CqChartComponent } from './cq_chart/cq_chart';
import { CqTagsComponent } from './cq_tags/cq_tags';
import { CqWillStartInComponent } from './cq_will_start_in/cq_will_start_in';

@NgModule({
    declarations: [
        CqTileComponent,
        CqHeaderComponent,
        CqEmptyComponent,
        CqFilterComponent,
        CqFilterComponentModal,
        CqChartComponent,
        CqTagsComponent,
        CqWillStartInComponent,
    ],
    imports: [
        CoreSharedModule,
        CoreMainMenuComponentsModule,
    ],
    exports: [
        CqTileComponent,
        CqHeaderComponent,
        CqEmptyComponent,
        CqFilterComponent,
        CqFilterComponentModal,
        CqChartComponent,
        CqTagsComponent,
        CqWillStartInComponent,
    ],
})
export class CqComponentsModule {}
