import { NgModule } from '@angular/core';
import { CoreSharedModule } from '@/core/shared.module';
import { CoreMainMenuComponentsModule } from '@features/mainmenu/components/components.module';
import { CqTileComponent } from './cq_tile/cq_tile';
import { CqHeaderComponent } from './cq_header/cq_header';
import { CqEmptyComponent } from './cq_empty/cq_empty';
import { CqLineChartComponent } from './cq_line_chart/cq_line_chart';

@NgModule({
    declarations: [
        CqTileComponent,
        CqHeaderComponent,
        CqEmptyComponent,
        CqLineChartComponent,
    ],
    imports: [
        CoreSharedModule,
        CoreMainMenuComponentsModule,
    ],
    exports: [
        CqTileComponent,
        CqHeaderComponent,
        CqEmptyComponent,
        CqLineChartComponent,
    ],
})
export class CqComponentsModule {}
