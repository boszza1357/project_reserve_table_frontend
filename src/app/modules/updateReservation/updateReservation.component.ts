import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-updateReservation',
  templateUrl: './updateReservation.component.html',
  styleUrls: ['./updateReservation.component.css']
})
export class UpdateReservationComponent implements OnInit {

  constructor(
    private callService: CallserviceService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activated: ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) { }

  reservation: any;
  reservationId: any;
  reservationDetail: any;
  tableIdDetaill: any;
  tableId: any;

  timeSlots = [
    { startTime: '09:00:00', endTime: '12:00:00' },
    { startTime: '13:00:00', endTime: '16:00:00' },
    { startTime: '20:00:00', endTime: '23:00:00' }
  ];

  availableTimeSlots: { startTime: string; endTime: string }[] = [];

  ngOnInit() {
    this.reservation = this.activated.snapshot.paramMap.get("reservationId");
    this.callService.getReservationByTableId(this.reservation).subscribe((res) => {
      if (res.data) {
        this.setDateForm(res.data);
        this.reservationId = res.data.reservationsId;
        this.reservationDetail = res.data;

        const tableId = res.data.tableId;
        this.callService.getProductByProductId(tableId).subscribe((res) => {
          if (res.data) {
            this.tableIdDetaill = res.data;
            this.tableId = res.data.tablesId;
          }
        });

        // อัปเดต availableTimeSlots เมื่อโหลดข้อมูลการจอง
        this.updateAvailableTimeSlots(res.data.bookingDate, res.data.tableId, res.data.startTime, res.data.endTime);
      }
    });
  }

  updateReservationForm: FormGroup = this.formBuilder.group({
    bookingDate: [''],
    timeSlot: ['']
  });

  setDateForm(data: any) {
    const timeSlot = this.getTimeSlot(data.startTime, data.endTime);
    this.updateReservationForm.patchValue({
      bookingDate: data.bookingDate,
      timeSlot: timeSlot
    });
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

  getTimeSlot(startTime: string, endTime: string): string {
    const slot = this.timeSlots.find(slot => slot.startTime === startTime && slot.endTime === endTime);
    return slot ? `${slot.startTime}-${slot.endTime}` : '';
  }

  onDateChange() {
    const bookingDate = this.updateReservationForm.get('bookingDate')!.value;
    const tableId = this.tableId;
    if (bookingDate && tableId) {
      this.updateAvailableTimeSlots(bookingDate, tableId);
    }
  }

  updateAvailableTimeSlots(bookingDate: string, tableId: string, currentStartTime?: string, currentEndTime?: string) {
    const data = {
      bookingDate: bookingDate,
      tableId: tableId
    };
    this.callService.getBookedSlotsByTableIdAndDate(data).subscribe((res) => {
      if (res.data) {
        this.availableTimeSlots = this.timeSlots.filter(slot => 
          !res.data.some((bookedSlot: any) => 
            bookedSlot.startTime === slot.startTime && bookedSlot.endTime === slot.endTime
          )
        );

        // เพิ่มช่วงเวลาเดิมที่จองไว้ (ถ้ามี)
        if (currentStartTime && currentEndTime) {
          const currentSlot = { startTime: currentStartTime, endTime: currentEndTime };
          if (!this.availableTimeSlots.some(slot => slot.startTime === currentStartTime && slot.endTime === currentEndTime)) {
            this.availableTimeSlots.push(currentSlot);
          }
        }
      }
    });
  }

  // onSubmit() {
    
  //   const [startTime, endTime] = this.updateReservationForm.get('timeSlot')!.value.split('-');
  //   const data = {
  //     bookingDate: this.updateReservationForm.get('bookingDate')!.value,
  //     startTime: startTime,
  //     endTime: endTime
  //   };

  //   this.callService.reservationUpDate(data, this.reservationId).subscribe(res => {
  //     if (res.data) {
  //       Swal.fire({
  //         icon: 'success',
  //         title: 'สำเร็จ!',
  //         text: 'เลื่อนรอบจองสำเร็จ',
  //         confirmButtonText: 'ตกลง',
  //       }).then(res => {
  //         if (res.isConfirmed) {
  //           this.router.navigate(['/manage-reservation']);
  //         }
  //       });
  //     } else {
  //       Swal.fire({
  //         icon: 'warning',
  //         title: 'เลื่อนรอบจองไม่สำเร็จ!',
  //         text: 'กรุณาตรวจสอบข้อมูล ด้วยค่ะ',
  //         confirmButtonText: 'ตกลง',
  //       });
  //     }
  //   });
  // }
  onSubmit() {
    Swal.fire({
      icon: 'question',
      title: 'ยืนยันการเลื่อนรอบจอง?',
      text: 'คุณต้องการเลื่อนรอบจองนี้หรือไม่?',
      showCancelButton: true,
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก'
    }).then(result => {
      if (result.isConfirmed) {
        const [startTime, endTime] = this.updateReservationForm.get('timeSlot')!.value.split('-');
        const data = {
          bookingDate: this.updateReservationForm.get('bookingDate')!.value,
          startTime: startTime,
          endTime: endTime
        };

        this.callService.reservationUpDate(data, this.reservationId).subscribe(res => {
          if (res.data) {
            Swal.fire({
              icon: 'success',
              title: 'สำเร็จ!',
              text: 'เลื่อนรอบจองสำเร็จ',
              confirmButtonText: 'ตกลง',
            }).then(res => {
              if (res.isConfirmed) {
                this.router.navigate(['/manage-reservation']);
              }
            });
          } else {
            Swal.fire({
              icon: 'warning',
              title: 'เลื่อนรอบจองไม่สำเร็จ!',
              text: 'กรุณาตรวจสอบข้อมูล ด้วยค่ะ',
              confirmButtonText: 'ตกลง',
            });
          }
        });
      }
    });
  }
}
