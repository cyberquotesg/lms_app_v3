// done v3

import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CqDashboardMain } from './cq_dashboard_main';
import { CoreComponentsModule } from '@components/components.module';
import { CoreDirectivesModule } from '@directives/directives.module';

@NgModule({
    declarations: [
        CqDashboardMain
    ],
    imports: [
        CoreComponentsModule,
        CoreDirectivesModule,
        TranslateModule.forChild()
    ],
})
export class CqDashboardMainModule {}
