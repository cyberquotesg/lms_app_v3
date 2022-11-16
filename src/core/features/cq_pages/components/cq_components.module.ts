import { NgModule } from '@angular/core';
import { CoreSharedModule } from '@/core/shared.module';
import { CoreMainMenuComponentsModule } from '@features/mainmenu/components/components.module';
import { CqTileComponent } from '@features/cq_pages/components/cq_tile/cq_tile';
import { CqHeaderComponent } from '@features/cq_pages/components/cq_header/cq_header';

@NgModule({
    declarations: [
        CqTileComponent,
        CqHeaderComponent,
    ],
    imports: [
        CoreSharedModule,
        CoreMainMenuComponentsModule,
    ],
    exports: [
        CqTileComponent,
        CqHeaderComponent,
    ],
})
export class CqComponentsModule {}
