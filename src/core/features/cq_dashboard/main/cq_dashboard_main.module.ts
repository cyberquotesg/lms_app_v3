// (C) Copyright 2015 Moodle Pty Ltd.

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { CqDashboardPage } from './cq-dashboard-page';
import { CoreComponentsModule } from '@components/components.module';
import { CoreDirectivesModule } from '@directives/directives.module';

@NgModule({
    declarations: [
        CqDashboardPage
    ],
    imports: [
        CoreComponentsModule,
        CoreDirectivesModule,
        IonicPageModule.forChild(CqDashboardPage),
        TranslateModule.forChild()
    ],
})
export class CqDashboardPageModule {}
