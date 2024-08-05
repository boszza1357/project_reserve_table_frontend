import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, concat } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';

const API_ENDPOINT = environment.API_ENDPOINT;
const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'accept': '*/*' }) };
const httpOptionsText = { headers: new HttpHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }) };


@Injectable({
  providedIn: 'root'
})
export class CallserviceService {

  constructor(
    private http: HttpClient
  ) { }

  getAllRole() : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/role/getAll'));
  }

  saveRegister(data : any) : Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post<any>(API_ENDPOINT.concat('/register/save'), body, httpOptions)
  }

  
  authen(userName:any, password:any) : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/login/authen?userName=' + userName + '&password='+ password))
  }

  // ดึงข้อมูล User
  
  getByUserId(userId:any) : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/register/getById?userId=' + userId))
  }

  updateProfile(data : any, userId : any) : Observable<any> {
    const body = JSON.stringify(data);
    return this.http.put<any>(API_ENDPOINT.concat('/register/update/'+ userId), body, httpOptions)
  }
  
  getAllUser() : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/manage/user/getAllUser'));
  }
  deleteUserByUserId(userId : any) : Observable<any> {
    return this.http.delete(API_ENDPOINT.concat('/register/delete?userId='+ userId));
  }

  // api ของ mangePrduct
  
  //  apiTable , TableImg

  

  getAllProduct() : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/table/getAll'));
  }

  getProductImgByProductId(tableId :any) : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/table/getTableImgByTableId?tableId=' + tableId))
  }

  getBlobThumbnail(fileName: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'    
    });
    return this.http.get<Blob>(API_ENDPOINT.concat('/table/getImageByte?fileName='+fileName)
    , {headers: headers, responseType: 'blob' as 'json' });
  }

    // api Type Table
  getProductTypeAll() : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/table/getTableTypeAll'));
  }
  getProductByTableTypeId(tableTypeId: any): Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/table/getTableTypeById?tableTypeId=' + tableTypeId));
  }

  // ลบ สินค้า
  deleteProduct(tableId : any) : Observable<any> {
    return this.http.delete(API_ENDPOINT.concat('/table/delete?tableId='+ tableId));
  }

///

  /// บันทึก Table

  saveProduct(data : any) : Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post<any>(API_ENDPOINT.concat('/table/save'), body, httpOptions)
  }

  saveImage(formData: FormData, tableId : any) : Observable<any> {
    return this.http.post<any>(API_ENDPOINT.concat('/table/saveImage/' + tableId), formData)
  }

  // updateProduct

  getProductByProductId(tableId: any): Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/table/getById?tableId=' + tableId));
  }

  updateProduct(data : any, tableId : any) : Observable<any> {
    const body = JSON.stringify(data);
    return this.http.put<any>(API_ENDPOINT.concat('/table/update/'+ tableId), body, httpOptions)
  }

  deleteImage(fileName : any) : Observable<any> {
    return this.http.delete(API_ENDPOINT.concat('/table/deleteImgByFileName?fileName='+ fileName));
  }

  getImageByte(fileName: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'    
    });
    return this.http.get<Blob>(API_ENDPOINT.concat('/table/getImageByte?fileName='+fileName)
    , {headers: headers, responseType: 'blob' as 'json' });
  }

  // reservation

  getReservationByTableId(reservationsId: any): Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/reservation/getById?reservationsId=' + reservationsId));
  }

  getReservationAll() : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/reservation/getAll'));
  }
  
  reservationSave(data : any) : Observable<any>{
    const Body = JSON.stringify(data);
    return this.http.post<any>(API_ENDPOINT.concat('/reservation/save'),Body,httpOptions)
  }

  reservationUpDate(data : any, reservationId : any) : Observable<any> {
    const body = JSON.stringify(data);
    return this.http.put<any>(API_ENDPOINT.concat('/reservation/update/'+ reservationId), body, httpOptions)
  }

  deleteReservation(reservationsId : any) : Observable<any> {
    return this.http.delete(API_ENDPOINT.concat('/reservation/delete?reservationsId='+ reservationsId));
  }

  // ดึงเวลามาโชว์
    getBookedSlotsByTableIdAndDate(data: any): Observable<any> {
      const body = JSON.stringify(data);
      return this.http.post<any>(API_ENDPOINT.concat('/reservation/getAllTime'), body, httpOptions);
    }

  // payment

  paymentgetById(paymentId: any): Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/paymentId/getById?paymentId=' + paymentId));
  }


  paymentgetAll() : Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/payment/getAll'));
  }

  PaymentSave(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post<any>(API_ENDPOINT.concat('/payment/save'), body, httpOptions);
  }
  

  paymentDelete(paymentId : any ,reservationsId : any ) : Observable<any> {
    return this.http.delete(API_ENDPOINT.concat(`/payment/delete?paymentId=${paymentId}&reservationsId=${reservationsId}`));
  }

  // uploadSlip
  uploadSlip(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(API_ENDPOINT.concat('/paymentapi/api'), formData, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${environment.AUTH_TOKEN}`
      })
    });
  }

  // bookingHistory

  bookingHistroy(userId: any): Observable<any> {
    return this.http.get(API_ENDPOINT.concat('/payment/getUserByBooking?userId=' + userId));
  }

}





