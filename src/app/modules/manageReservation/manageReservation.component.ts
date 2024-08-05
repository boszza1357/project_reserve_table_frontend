import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manageReservation',
  templateUrl: './manageReservation.component.html',
  styleUrls: ['./manageReservation.component.css']
})
export class ManageReservationComponent implements OnInit {

  constructor(
    private callService: CallserviceService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) { }
 
  searchQuery: string = '';
  reservationList: any[] = [];
  filteredReservationList: any[] = [];


  ngOnInit() {


    this.callService.getReservationAll().subscribe(res => {
      if (res.data) {
        this.reservationList = res.data.map((item: any) => ({
          ...item,
          user: '',
          table: '',
          tableimg: []
        }));

        for (let reservation of this.reservationList) {
          this.callService.getByUserId(reservation.userId).subscribe((res) => {
            reservation.user = res.data;
          });

          this.callService.getProductByProductId(reservation.tableId).subscribe((res) => {
            reservation.table = res.data;
          });

          this.callService.getProductImgByProductId(reservation.tableId).subscribe((res) => {
            if (res.data) {
              const imageObservables: Observable<SafeUrl>[] = res.data.map((img: any) => this.getImage(img.tableImgName));
              forkJoin(imageObservables).subscribe((imageUrls: SafeUrl[]) => {
                reservation.tableimg = imageUrls;
              });
            }
          });

          this.filteredReservationList = this.reservationList;
        }
      }
    });
  }
  onSearch() {
    console.log('Search query:', this.searchQuery);
    if (this.searchQuery) {
      this.filteredReservationList = this.reservationList.filter(item =>
        (item.user.fristName && item.user.fristName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.user.lastName && item.user.lastName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.table.tableName && item.table.tableName.toLowerCase().includes(this.searchQuery.toLowerCase()))
      );
    } else {
      this.filteredReservationList = this.reservationList;
    }
    console.log('Filtered reservationList:', this.filteredReservationList);
  }

  getImage(fileName: any): Observable<SafeUrl> {
    return this.callService.getImageByte(fileName).pipe(
      map((res: Blob) => {
        let objectURL = URL.createObjectURL(res);
        return this.sanitizer.bypassSecurityTrustUrl(objectURL);
      })
    );
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

  
  onDeleteRservation(reservationsId : any){
    if(reservationsId){
      console.log(typeof reservationsId)
      Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
      text: "คุณต้องการยกเลิกการจองนี้ใช่หรือไม่!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ยืนยัน!',
      cancelButtonText: 'ยกเลิก'
      }).then((result)=>{
        if(result.isConfirmed){
          this.callService.deleteReservation(reservationsId).subscribe(res=>{
            if(res.data){
              Swal.fire({
                icon: 'success',
                title: 'ยกเลิกการจอง',
                text: 'การจองถูกยกเลิกแล้ว',
                confirmButtonText: 'ตกลง'
              }).then(()=>{
                window.location.reload();
              })
              
            }
          })
        }
      })
     
    }
  }

  onUpdateRservation(reservationId : any){
    this.router.navigate(['/manage-reservation/'+ reservationId])
  }
  
}
