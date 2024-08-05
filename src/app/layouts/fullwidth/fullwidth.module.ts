import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullwidthComponent } from './fullwidth.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { HomeComponent } from 'src/app/modules/home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPermissionsModule } from 'ngx-permissions';
import { NgxLoadingModule } from 'ngx-loading';
import { RegisterComponent } from 'src/app/modules/register/register.component';
import { LoginComponent } from 'src/app/modules/login/login.component';
import { DashbordAdminComponent } from 'src/app/modules/dashbordAdmin/dashbordAdmin.component';
import { ProfileComponent } from 'src/app/modules/profile/profile.component';
import { ManageUserComponent } from 'src/app/modules/manageUser/manageUser.component';
import { ManageProductComponent } from 'src/app/modules/manageProduct/manageProduct.component';
import { ProductComponent } from 'src/app/modules/product/product.component';
import { UpdateProductComponent } from 'src/app/modules/updateProduct/updateProduct.component';
import { ReportComponent } from 'src/app/modules/report/report.component';
import { ReservationComponent } from 'src/app/modules/reservation/reservation.component';
import { PaymentComponent } from 'src/app/modules/payment/payment.component';
import { QRCodeModule } from 'angularx-qrcode';
import { PaymentSuccessfulComponent } from 'src/app/modules/PaymentSuccessful/PaymentSuccessful.component';
import { ManageReservationComponent } from 'src/app/modules/manageReservation/manageReservation.component';
import { UpdateReservationComponent } from 'src/app/modules/updateReservation/updateReservation.component';
import { OrderComponent } from 'src/app/modules/order/order.component';
import { BookingHistoryComponent } from 'src/app/modules/bookingHistory/bookingHistory.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    SharedModule,
    FormsModule,
    NgxPermissionsModule.forRoot(),
    ReactiveFormsModule,
    NgxLoadingModule.forRoot({}),
    QRCodeModule
  ],
  declarations: [
    FullwidthComponent,
    HomeComponent,
    RegisterComponent,
    LoginComponent,
    DashbordAdminComponent,
    ProfileComponent,
    ManageUserComponent,
    ManageProductComponent,
    ProductComponent,
    ManageReservationComponent,
    UpdateProductComponent,
    ReportComponent,
    ReservationComponent,
    PaymentComponent,
    PaymentSuccessfulComponent,
    UpdateReservationComponent,
    OrderComponent,
    BookingHistoryComponent
    
  ]
})
export class FullwidthModule { }
