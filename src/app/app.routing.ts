import {ModuleWithProviders}  from '@angular/core';
import {Routes,RouterModule} from '@angular/router';


import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UserComponent } from './pages/user/user.component';
import { ProductComponent } from './pages/product/product.component';
import { SupportComponent } from './pages/support/support.component';
import { SaleComponent } from './pages/sale/sale.component';
import { EventSaleComponent } from './pages/event-sale/event-sale.component';
import { EventComponent } from './pages/event/event.component';
import { StoreComponent } from './pages/store/store.component';
import { AccountComponent } from './pages/account/account.component';
import { AcquirerComponent } from './pages/acquirer/acquirer.component';
import{ PaymentsComponent } from './pages/payments/payments.component';
import{ LogComponent } from './pages/log/log.component';
import{ ProfilesComponent } from './pages/profiles/profiles.component';

import { AuthGuard } from './services/auth.service';
import { AdminGuard } from './services/admin.service';

const APP_ROUTES: Routes=[
    {path: 'login', component: LoginComponent},
    {path: '', redirectTo: 'sales', pathMatch: 'full'},
    {path: 'resume', component: DashboardComponent, canActivate: [AuthGuard] },
    {path: 'users', component: UserComponent, canActivate: [AuthGuard, AdminGuard] },
    {path: 'items', component: ProductComponent, canActivate: [AuthGuard] },
    {path: 'sales', component: SaleComponent, canActivate: [AuthGuard] },
    {path: 'events', component: EventComponent, canActivate: [AuthGuard] },
    {path: 'event-sales', component: EventSaleComponent, canActivate: [AuthGuard] },
    {path: 'store', component: StoreComponent, canActivate: [AuthGuard, AdminGuard] },
    {path: 'support', component: SupportComponent, canActivate: [AuthGuard] },
    {path: 'account', component: AccountComponent, canActivate: [AuthGuard, AdminGuard] },
    {path: 'acquirer', component: AcquirerComponent, canActivate: [AuthGuard, AdminGuard] },
    {path: 'payments', component: PaymentsComponent, canActivate: [AuthGuard] },
    {path: 'logs', component: LogComponent, canActivate: [AuthGuard, AdminGuard] },
    {path: 'profiles', component: ProfilesComponent, canActivate: [AuthGuard] }
    

];

export const routing: ModuleWithProviders = RouterModule.forRoot(APP_ROUTES);
