import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-bookingHistory',
  templateUrl: './bookingHistory.component.html',
  styleUrls: ['./bookingHistory.component.css']
})
export class BookingHistoryComponent implements OnInit {

  constructor(
    private callService: CallserviceService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  userDate : any
  bookingHistoryDetail : any

  ngOnInit() {

    const userDetailSession: any = sessionStorage.getItem("userDetail");
        if (userDetailSession) {
            this.userDate = JSON.parse(userDetailSession);
            console.log('userId:', this.userDate.userId);
            console.log('userDetail:', this.userDate);
        }

    this.callService.bookingHistroy(this.userDate.userId).subscribe((res)=>{
      if(res.data){
        this.bookingHistoryDetail = res.data.map((booking : any)=> ({
          ...booking,
          reservation : '',
          table : '',
          tableType : ''
        }))
        for(let booking of this.bookingHistoryDetail ){
          this.callService.getReservationByTableId(booking.reservationId).subscribe((res)=>{
            booking.reservation  = res.data

            this.callService.getProductByProductId(res.data.tableId).subscribe((res)=>{
            booking.table = res.data

            this.callService.getProductByTableTypeId(res.data.tablesTypeId).subscribe((res)=>{
            booking.tableType = res.data
            })
            })
          })
        }

        console.log("bookingHistoryDetail", this.bookingHistoryDetail)
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

}
