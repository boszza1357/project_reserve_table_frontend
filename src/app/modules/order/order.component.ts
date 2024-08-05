import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {

  constructor(
    private callService : CallserviceService,
    private router : Router
  ) { }
  paymentList : any
  paymentId : any
  reservationId : any

  ngOnInit() {
    this.callService.paymentgetAll().subscribe((res)=>{
      if(res.data){
        console.log("paymentLiset",res.data)
        
        this.paymentList = res.data.map((payment :any)=> ({
          ... payment,
          user : '',
          reservation : '',
          table : '',
          tableType : ''
        }))

        for(let payment of this.paymentList){

          this.callService.getByUserId(payment.userId).subscribe((res)=>{
            payment.user = res.data;
          })

          this.callService.getReservationByTableId(payment.reservationId).subscribe((res)=>{
            payment.reservation = res.data;
            
            this.callService.getProductByProductId(res.data.tableId).subscribe((res)=>{
              payment.table = res.data;

            this.callService.getProductByTableTypeId(res.data.tablesTypeId).subscribe((res)=>{
              payment.tableType = res.data
            })  

            })
          })
        }
      }
    
    })
  }
  formatTime(time: string): string {
    if (!time) return ''; // ตรวจสอบเพื่อป้องกันค่าที่ไม่ถูกต้อง (optional)
  
    const parts = time.split(':'); // แยกส่วนของเวลา
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`; // เฉพาะชั่วโมงและนาที
    } else {
      return time; // คืนค่าเวลาเดิมถ้ามีข้อผิดพลาด
    }
  }

  onDeletePayment(paymentId: any, reservationsId: any) {
    if (paymentId && reservationsId) {
      Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: "คุณต้องการลบการชำระเงินและการจองนี้ใช่หรือไม่?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
      }).then((result) => {
        if (result.isConfirmed) {
          this.callService.paymentDelete(paymentId, reservationsId).subscribe(res => {
            if (res.data) {
              Swal.fire({
                icon: 'success',
                title: 'ลบสำเร็จ!',
                text: 'การชำระเงินและการจองถูกลบแล้ว',
                confirmButtonText: 'ตกลง'
              }).then(() => {
                window.location.reload(); // รีเฟรชหน้าเพจหรือคอมโพเนนต์ตามที่ต้องการ
              });
            }
          }, error => {
            Swal.fire({
              icon: 'error',
              title: 'เกิดข้อผิดพลาด!',
              text: 'เกิดข้อผิดพลาดในการลบการชำระเงินหรือการจอง',
              confirmButtonText: 'ตกลง'
            });
          });
        }
      });
    }
  }
  

}
