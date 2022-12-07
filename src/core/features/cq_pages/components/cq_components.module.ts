import { NgModule } from '@angular/core';
import { CoreSharedModule } from '@/core/shared.module';
import { CoreMainMenuComponentsModule } from '@features/mainmenu/components/components.module';
import { CqTileComponent } from './cq_tile/cq_tile';
import { CqHeaderComponent } from './cq_header/cq_header';
import { CqEmptyComponent } from './cq_empty/cq_empty';
import { CqFilterComponent } from './cq_filter/cq_filter';
import { CqFilterComponentModal } from './cq_filter/cq_filter_modal';
import { CqChartComponent } from './cq_chart/cq_chart';

@NgModule({
    declarations: [
        CqTileComponent,
        CqHeaderComponent,
        CqEmptyComponent,
        CqFilterComponent,
        CqFilterComponentModal,
        CqChartComponent,
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
    ],
})
export class CqComponentsModule {}
