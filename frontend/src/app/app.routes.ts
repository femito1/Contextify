import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { OutputComponent } from './output/output.component';
export const routes: Routes = [
    {path:"home", component: AppComponent},
    {path:"output", component: OutputComponent},
    { path: '', redirectTo: 'home', pathMatch: 'full' },

];
