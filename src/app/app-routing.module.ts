import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WheelComponent } from './wheel/wheel.component';
import { ManageCountriesComponent } from './manage-countries/manage-countries.component';
import { GlobeComponent } from './globe/globe.component';
import { adminGuard } from './admin.guard';

const routes: Routes = [
    { path: '', component: WheelComponent },
    { path: 'globe', component: GlobeComponent },
    { path: 'admin', component: ManageCountriesComponent, canActivate: [adminGuard] },
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
