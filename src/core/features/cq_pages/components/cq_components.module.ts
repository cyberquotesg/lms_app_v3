import { NgModule } from '@angular/core';
import { CoreSharedModule } from '@/core/shared.module';
import { CoreMainMenuComponentsModule } from '@features/mainmenu/components/components.module';
import { CqTileComponent } from './cq_tile/cq_tile';
import { CqHeaderComponent } from './cq_header/cq_header';
import { CqEmptyComponent } from './cq_empty/cq_empty';

@NgModule({
    declarations: [
        CqTileComponent,
        CqHeaderComponent,
        CqEmptyComponent,
    ],
    imports: [
        CoreSharedModule,
        CoreMainMenuComponentsModule,
    ],
    exports: [
        CqTileComponent,
        CqHeaderComponent,
        CqEmptyComponent,
    ],
})
export class CqComponentsModule {}
