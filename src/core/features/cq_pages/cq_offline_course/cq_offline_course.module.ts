// done v3

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreSharedModule } from '@/core/shared.module';
import { CoreMainMenuUserMenuComponent } from '@/core/features/mainmenu/components/user-menu/user-menu';
import { CoreMainMenuUserButtonComponent } from '@features/mainmenu/components/user-menu-button/user-menu-button';
import { CoreMainMenuUserMenuTourComponent } from '@features/mainmenu/components/user-menu-tour/user-menu-tour';
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
        CoreMainMenuUserMenuComponent,
        CoreMainMenuUserButtonComponent,
        CoreMainMenuUserMenuTourComponent,
        CqComponentsModule,
    ],
    declarations: [
        CqOfflineCourse,
    ],
    exports: [RouterModule],
})
export class CqOfflineCourseModule {}
