// done v3

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreSharedModule } from '@/core/shared.module';
import { CoreMainMenuComponentsModule } from '@features/mainmenu/components/components.module';
import { CqComponentsModule } from '../components/cq_components.module';
import { conditionalRoutes } from '@/app/app-routing.module';
import { CoreScreen } from '@services/screen';
import { CqOfflineCourse } from './cq_offline_course';

const routes: Routes = [
    {
        path: '',
        component: CqOfflineCourse,
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
        CqOfflineCourse,
    ],
    exports: [RouterModule],
})
export class CqOfflineCourseModule {}
