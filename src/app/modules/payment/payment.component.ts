import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as generatePayload from 'promptpay-qr';
import * as QRCode from 'qrcode';
import { CallserviceService } from '../services/callservice.service';
import { DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-payment',
    templateUrl: './payment.component.html',
    styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
    @ViewChild('qrCanvas', { static: true }) qrCanvas: ElementRef<HTMLCanvasElement>;
    fileToUpload: File | null = null;

    qrCodeData: string | ArrayBuffer | null;
    reservationsId: any;
    tableId: any;
    tablePrice: any;
    userDate: any;
    tableDetail: any;
    tableTypeData: any;
    reservationsDetail : any

    countdownTimeInSeconds: number = 600; // 5 minutes
    countdownTimer: number;

    constructor(
        private callService: CallserviceService,
        private router: Router,
        private route: ActivatedRoute,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit() {

        const userDetailSession: any = sessionStorage.getItem("userDetail");
        if (userDetailSession) {
            this.userDate = JSON.parse(userDetailSession);
            console.log('userId:', this.userDate.userId);
        }

        this.reservationsId = this.route.snapshot.paramMap.get('reservationsId');
        this.getReservationById(this.reservationsId);
        this.startCountdown();
        
      
    }

    getReservationById(reservationsId: any) {
        this.callService.getReservationByTableId(reservationsId).subscribe((res) => {
            if (res.data) {
                console.log(res.data)
                console.log("reservatiosId" ,  typeof this.reservationsId)
                this.reservationsId = res.data.reservationsId;
                this.reservationsDetail = res.data;
                this.tableId = res.data.tableId;
                this.getTablePriceById(this.tableId);
            }
        });
    }

    startCountdown() {
        this.countdownTimer = window.setInterval(() => {
            this.countdownTimeInSeconds--;
            if (this.countdownTimeInSeconds <= 0) {
                this.deleteReservation(this.reservationsId);
                Swal.fire({
                    icon: 'error',
                    title: 'หมดเวลา',
                    text: 'เนื่องจากหมดเวลาชำระ กรุณาเลือกรอบจองใหม่',
                    showConfirmButton: true
                }).then(() => {
                    this.router.navigate(['']); // นำทางไปยังหน้า home หรือหน้าที่ต้องการ
                });
                clearInterval(this.countdownTimer); // Stop the countdown when it reaches zero
            }
            // Update the countdown display in the HTML
            const countdownElement = document.getElementById('countdown');
            if (countdownElement) {
                countdownElement.textContent = this.formatCountdownTime(this.countdownTimeInSeconds);
            }
        }, 1000); // Decrement every second
    }

    formatCountdownTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    
    getTablePriceById(tableId: any) {
        this.callService.getProductByProductId(tableId).subscribe((res) => {
            if (res.data) {
                this.tableDetail = res.data;
                this.tablePrice = res.data.price;
                console.log("TableDetail:", this.tableDetail); 
                console.log("TablePrice:", this.tablePrice); 
    
                const IDCardNumber = '1-4499-00640-87-4';
                const amount = this.tablePrice;
                const payload = generatePayload(IDCardNumber, { amount });
                QRCode.toCanvas(this.qrCanvas.nativeElement, payload, (error) => {
                    if (error) {
                        console.error('Error generating QR code:', error);
                    }
                });
                this.getTableTypeById(this.tableDetail.tablesTypeId);
            }
        });
    }

    getTableTypeById(tableTypeId: any) {
        this.callService.getProductByTableTypeId(tableTypeId).subscribe((res) => {
            if (res.data) {
                this.tableTypeData = res.data;
                console.log("TableTypeData:", this.tableTypeData);
                // Now you have table type data available here
            }
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

   

    handleFileInput(event: any) {
        this.fileToUpload = event.target.files.item(0);
        if (this.fileToUpload) {
            this.readImageAsDataURL(this.fileToUpload);
        }
    }

    readImageAsDataURL(file: File) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
            this.qrCodeData = event.target.result;
            this.generateQRCode();
        };
        reader.readAsDataURL(file);
    }

    generateQRCode() {
        if (this.qrCodeData) {
            const payload = generatePayload('1-4499-00640-87-4', { amount: this.tablePrice });
            QRCode.toCanvas(this.qrCanvas.nativeElement, payload, (error) => {
                if (error) {
                    console.error('Error generating QR code:', error);
                }
            });
        }
    }

     

    checkPayment(paymentData: any) {
     
        if (paymentData && paymentData.data && paymentData.data.receiver && paymentData.data.receiver.account&& paymentData.data.amount.amount) {
        
            if (paymentData.data.receiver.account.proxy.type === 'NATID' &&
                paymentData.data.receiver.account.proxy.account === 'XXXXXXXXX0874') {
                console.log('การโอนเงินเป็นของจริง');
                this.verifyPaymentAmount(paymentData.data.amount.amount);
             
            } else {
                 Swal.fire({
                icon: 'error',
                title: 'การโอนเงินไม่ถูกต้อง',
                text: 'กรุณาตรวจสอบบัญชีผู้รับเงิน',
                showConfirmButton: true
            });
            
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'ข้อมูลการโอนเงินไม่ครบถ้วน',
                text: 'กรุณาตรวจสอบข้อมูลการโอนเงิน',
                showConfirmButton: true
            });
            return;
        }
      
    }

    verifyPaymentAmount(paymentAmount: number) {
        if (paymentAmount === this.tablePrice) {
            console.log('จำนวนเงินถูกต้อง');
            this.savePaymentData();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'จำนวนเงินไม่ตรงกัน',
                text: 'ยอดเงินไม่ตรงกับราคาโต๊ะ กรุณาตรวจสอบใหม่อีกครั้ง',
                showConfirmButton: true
            });
            return;
        }
    
    }

    savePaymentData() {
        const data = {
            userId: parseInt(this.userDate.userId),
            reservationId : parseInt(this.reservationsId),
            pricePayment: this.tablePrice.toString() 
        };
        this.callService.PaymentSave(data).subscribe((res) => {
            if (res.data) {
               Swal.fire({
                    icon: 'question',
                    title: 'ตรวจสอบ',
                    text: 'ระบบกำลังทำการตรวจสอบกรุณารอสักครู่',
                    timer: 2500,
                    timerProgressBar: true,
                    showLoaderOnConfirm: true,
                    showConfirmButton: false,
                }).then(()=>{
                    Swal.fire({
                        icon: "success",
                        title: "ชำระเงินเสร็จ",
                        showConfirmButton: false,
                        timer: 1500
                      }).then(()=>{
                          
                          this.router.navigate(['/paymentsuccessful']); 
                          clearInterval(this.countdownTimer); 
                      })
                
                })
                  
             
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถบันทึกข้อมูลการชำระเงินได้ กรุณาลองใหม่อีกครั้ง',
                    showConfirmButton: true
                }).then(()=>{
                    
                 this.deleteReservation(this.reservationsId);
                 clearInterval(this.countdownTimer); 
                })
            }
        });
    }

    

    deleteReservation(reservationId: any) {
        this.callService.deleteReservation(reservationId).subscribe((response) => {
            console.log('Reservation deleted successfully:', response);
            // ทำการอัพเดตสถานะหรือดำเนินการต่อไปตามที่ต้องการ
        }, error => {
            console.error('Error deleting reservation:', error);
            // จัดการกรณีที่เกิดข้อผิดพลาดในการลบข้อมูล
        });
    }


    checkDuplicateSlip(transRef: string): boolean {
    const uploadedSlips = JSON.parse(localStorage.getItem('uploadedSlips') || '[]');
    return uploadedSlips.includes(transRef);
}

saveTransRef(transRef: string): void {
    const uploadedSlips = JSON.parse(localStorage.getItem('uploadedSlips') || '[]');
    uploadedSlips.push(transRef);
    localStorage.setItem('uploadedSlips', JSON.stringify(uploadedSlips));
}



    

uploadFileToActivity() {
    if (this.fileToUpload) {
        this.callService.uploadSlip(this.fileToUpload).subscribe((data) => {
            console.log('File upload response', data);

            if(data.status === 200){
                if (!this.checkDuplicateSlip(data.data.transRef)) {
                    sessionStorage.setItem("Slip" , JSON.stringify(data))
                    this.saveTransRef(data.data.transRef);
                    this.checkPayment(data);
    
                    
        
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'สลิปซ้ำ',
                        text: 'สลิปนี้ถูกอัพโหลดแล้ว กรุณาใช้สลิปใหม่',
                        showConfirmButton: false
                    });
                }

            }else {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'รูปสลิปไม่ถูกต้อง กรุณาตรวจไฟล์รูปสลิป',
                    showConfirmButton: true
                });
            }
          

        }, error => {
            console.error('Error uploading file', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'รูปสลิปไม่ถูกต้อง กรุณาตรวจไฟล์รูปสลิป',
                showConfirmButton: true
            });
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'ไม่มีไฟล์สลิป',
            text: 'กรุณาอัพโหลดรูปสลิป',
            showConfirmButton: true
        });
    }
}
}
