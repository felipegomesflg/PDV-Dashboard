import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { Route,RouterModule } from '@angular/router';
import { HttpModule, JsonpModule } from '@angular/http';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from './services/data.service';

//MODULES INSTALADOS
import { AngularFireModule  } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { PaginationModule, ModalModule, AlertModule } from 'ng2-bootstrap';
import { Ng2TableModule } from 'ng2-table';
import { ToastModule,ToastOptions } from 'ng2-toastr/ng2-toastr';
import { LocalStorageModule } from 'angular-2-local-storage';
import { NgbModule,NgbDatepickerI18n,NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { Select2Module } from 'ng2-select2';
import { PopupComponent } from './comum/popups/components/popup.component';
import { PopupService } from './comum/popups/services/popup.service';
import { TextMaskModule } from 'angular2-text-mask';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { IntercomModule } from 'ng-intercom';


import {
  NgbDatepickerModule,
  NgbTimepickerModule
} from '@ng-bootstrap/ng-bootstrap';
import { CalendarModule } from 'angular-calendar';





//SERVICES
import { AuthGuard } from './services/auth.service';
import { ComumService,datePickerFormatterServiceFactory } from './services/comum.service';
import { pdfSenderService } from './services/pdfSender.service';
import { AcquirerService } from './services/acquirer.service';
import { DatePickerPtBr } from './services/datepicker.ptbr.service';
import { EmitterService } from './services/emitter.service'


//COMUM
import { HeaderComponent } from './comum/header.component';
import { FooterComponent } from './comum/footer.component';
import { MenuComponent } from './comum/menu.component';
import { CampoControlErroComponent } from './comum/campo-control-erro.component';
import { FormDebugComponent } from './comum/form-debug.component';

//APP
import { AppComponent } from './app.component';

//PAGES
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UserComponent } from './pages/user/user.component';
import { ProductComponent } from './pages/product/product.component';
import { SupportComponent } from './pages/support/support.component';
import { SaleComponent } from './pages/sale/sale.component';
import { EventComponent } from './pages/event/event.component';
import { StoreComponent } from './pages/store/store.component';
import { EventSaleComponent } from './pages/event-sale/event-sale.component';
import { AccountComponent } from './pages/account/account.component';
import { AcquirerComponent } from './pages/acquirer/acquirer.component';
import { LogComponent } from './pages/log/log.component';
import { ProfilesComponent } from './pages/profiles/profiles.component';
import { PersonalInformationComponent } from './pages/profiles/personal-information/personal-information.component';




//COMPONENTES
import { DatatableComponent } from './components/datatable/datatable.component';
import { AccountStoreComponent } from './components/accountStoreModal/account-store-modal.component';
import {  DatepickerRangeComponent } from './components/datePickerRange/datepicker-range.component';
import { PaymentsCalendarComponent,CalendarHeaderComponent,DateTimePickerComponent } from './components/payments-calendar/payments-calendar.component';
import { DropdownStoreComponent } from './components/dropdown-store/dropdown-store.component';


//ROUTER
import { routing } from './app.routing';
import { PaymentsComponent } from './pages/payments/payments.component';


//environment
import { config, host } from './app.environment';
import { AdminGuard } from './services/admin.service';



export class CustomOption extends ToastOptions {
  positionClass='toast-top-center'
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    HeaderComponent,
    FooterComponent,
    MenuComponent,
    UserComponent,
    ProductComponent,
    EventComponent,
    SupportComponent,
    DatatableComponent,
    AccountStoreComponent,
    SaleComponent,
	  CampoControlErroComponent,
    FormDebugComponent,
    PopupComponent,
    StoreComponent,
    EventSaleComponent,
    AccountComponent,
    AcquirerComponent,
    DatepickerRangeComponent,
    PaymentsCalendarComponent,
    CalendarHeaderComponent, 
    DateTimePickerComponent, 
    DropdownStoreComponent, 
    PaymentsComponent,
    LogComponent,
    LoginComponent,
    ProfilesComponent,
    PersonalInformationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    JsonpModule,
    routing,
    FormsModule,
    AngularFireModule.initializeApp(config.firebaseConfig[host]),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    Ng2TableModule,
    Select2Module,
    RouterModule,
    ReactiveFormsModule,
    ModalModule,
    AlertModule,
    TextMaskModule,
    ChartsModule,
    CalendarModule.forRoot(),
    PaginationModule.forRoot(),
    ToastModule.forRoot(),
    NgbModule.forRoot(),
    LocalStorageModule.withConfig({
      prefix: 'pagalee',
      storageType: 'localStorage'
    }),
    IntercomModule.forRoot({
      appId: 'c98c6070',
      updateOnRouterChange: true
    })
  ],
  providers: [AuthGuard,AdminGuard,ComumService,PopupService, DataService, EmitterService,pdfSenderService,AcquirerService,
    { provide: NgbDatepickerI18n, useClass: DatePickerPtBr },
    { provide: NgbDateParserFormatter, useFactory: datePickerFormatterServiceFactory },
    { provide: ToastOptions, useClass: CustomOption }
  ],
  exports:[CalendarHeaderComponent, DateTimePickerComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
