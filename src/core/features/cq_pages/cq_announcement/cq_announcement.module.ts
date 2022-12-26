// done v3

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreSharedModule } from '@/core/shared.module';
import { CoreMainMenuComponentsModule } from '@features/mainmenu/components/components.module';
import { CqComponentsModule } from '../components/cq_components.module';
import { conditionalRoutes } from '@/app/app-routing.module';
import { CoreScreen } from '@services/screen';
import { CqAnnouncement } from './cq_announcement';

const routes: Routes = [
    {
        path: '',
        component: CqAnnouncement,
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CoreSharedModule,
        CoreMainMenuComponentsModule,
        CqComponentsModule,
    ],
    declarations: [
        CqAnnouncement,
    ],
    exports: [RouterModule],
})
export class CqAnnouncementModule {}
