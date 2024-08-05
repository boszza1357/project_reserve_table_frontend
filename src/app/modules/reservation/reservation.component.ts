import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CallserviceService } from '../services/callservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {
  userDetails: any;
  tableTypeId: any;
  userId: any;
  tableId: any;
  tableDetails: any;
  tableTypeDetails: any;
  reservationForm: FormGroup;
  productImgList: any[] = [];
  imageBlobUrl: SafeUrl;
  isBooked: boolean = false;
  ImageList: { key: string, value: SafeUrl }[] = [];
  reservationDate: string;


  timeSlots = [
    { startTime: '09:00:00', endTime: '12:00:00' },
    { startTime: '13:00:00', endTime: '16:00:00' },
    { startTime: '20:00:00', endTime: '23:00:00' }
  ];

  selectedSlot: any = null;
  alreadyBookedSlots: any[] = [];

  constructor(
    private callService: CallserviceService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.tableId = this.route.snapshot.paramMap.get('tableId');
    this.tableTypeId = this.route.snapshot.paramMap.get('tableTypeId');
    
    const userDetailSession: any = sessionStorage.getItem("userDetail");
    this.userDetails = JSON.parse(userDetailSession);

    this.reservationForm = this.formBuilder.group({
      userId: this.userDetails.userId,
      tableId: this.tableId,
      bookingDate: '',
      startTime: '',
      endTime: ''
    });

    this.loadTableDetails(this.tableId);
    this.loadTableTypeDetails(this.tableTypeId);
    this.loadTableImages(this.tableId);
  }

  loadTableDetails(tableId: any) {
    this.callService.getProductByProductId(tableId).subscribe((res) => {
      if (res.data) {
        this.tableDetails = res.data;
        console.log("Table Details:", this.tableDetails);
      }
    });
  }



  loadTableTypeDetails(tableTypeId: any) {
    this.callService.getProductByTableTypeId(tableTypeId).subscribe((res) => {
      if (res.data) {
        this.tableTypeDetails = res.data;
        console.log("Table Type Details:", this.tableTypeDetails);
      }
    });
  }

  loadTableImages(tableId: any) {
    this.callService.getProductImgByProductId(tableId).subscribe((res) => {
      if (res.data) {
        this.productImgList = res.data;
        for (let productImg of this.productImgList) {
          this.getImage(productImg.tableImgName);
        }
      }
    });
  }

  loadBookedSlots(tableId: any) {
    if (this.reservationDate) {
      const data = { tableId: tableId, bookingDate: this.reservationDate };
      console.log('Request Data:', data);

      this.callService.getBookedSlotsByTableIdAndDate(data).subscribe((res) => {
        if (res.data) {
          this.alreadyBookedSlots = res.data;
          console.log("Already Booked Slots:", this.alreadyBookedSlots);
        } else {
          console.log("No data received");
        }
      }, error => {
        console.error("Error occurred while fetching booked slots:", error);
      });
    }
  }

  getImage(fileName: any) {
    this.callService.getImageByte(fileName).subscribe((res) => {
      let objectURL = URL.createObjectURL(res);       
      this.imageBlobUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      this.ImageList.push({
        key: fileName,
        value: this.imageBlobUrl
      });
    });
  }

  formatTime(time: string): string {
    return time.substring(0, 5);
  }

  isSlotAvailable(slot: any): boolean {
    const now = new Date();
    const currentDate = this.formatDate(now);
    const currentTime = this.formatTimeForComparison(now);

    const bookingDate = this.reservationDate;
    const slotEndTime = this.formatTimeForComparison(this.createDateFromString(`${bookingDate} ${slot.endTime}`));

    if (currentDate > bookingDate || (currentDate === bookingDate && currentTime > slotEndTime)) {
      return false;
    }

    return !this.alreadyBookedSlots.some(bookedSlot => 
      bookedSlot.startTime === slot.startTime && bookedSlot.endTime === slot.endTime
    );
  }

  createDateFromString(dateString: string): Date {
    return new Date(dateString.replace(/-/g, '/'));
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatTimeForComparison(date: Date): string {
    return date.toTimeString().split(' ')[0];
  }

  selectSlot(slot: any) {
    if (this.isSelected(slot)) {
      this.selectedSlot = null;
      this.reservationForm.patchValue({
        startTime: '',
        endTime: ''
      });
    } else {
      this.selectedSlot = slot;
      this.reservationForm.patchValue({
        startTime: slot.startTime,
        endTime: slot.endTime
      });
    }
    console.log('Selected Slot:', this.selectedSlot);
  }

  isSelected(slot: any): boolean {
    return this.selectedSlot?.startTime === slot.startTime && this.selectedSlot?.endTime === slot.endTime;
  }

  onpayment(reservationsId: any) {
    console.log('reservation :',  ); 
    this.router.navigate(['/payment', reservationsId]);  
  }

  onSubmit() {
    if (!this.reservationForm.value.bookingDate || !this.reservationForm.value.startTime || !this.reservationForm.value.endTime) {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่สามารถจองได้',
        text: 'กรุณาเลือกเวลาการจองก่อน',
        confirmButtonText: 'OK'
      });
      return;
    }

    const data = this.reservationForm.value;

    console.log('Reservation Form Data:', data);

    Swal.fire({
      title: 'Confirm Booking?',
      text: 'Do you want to book this table?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#56C596',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ยืนยันการจอง!',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        this.callService.reservationSave(data).subscribe(res => {
          if (res.data) {
            console.log('Response Data:', res.data);
            Swal.fire({
              icon: 'success',
              title: 'Booked Successfully',
              text: 'Your table has been booked!',
              confirmButtonText: 'OK'
            });
            this.onpayment(res.data);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Booking Failed',
              text: 'There was a problem booking your table.',
              confirmButtonText: 'OK'
            });
          }
        }, error => {
          Swal.fire({
            icon: 'error',
            title: 'Booking Failed',
            text: 'There was a problem booking your table.',
            confirmButtonText: 'OK'
          });
        });
      }
    });
  }
}
