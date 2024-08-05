import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manageUser',
  templateUrl: './manageUser.component.html',
  styleUrls: ['./manageUser.component.css']
})
export class ManageUserComponent implements OnInit {

  constructor(
    private callService : CallserviceService,
    private router : Router
  ) { }

  userList : any

  ngOnInit() {
    this.callService.getAllUser().subscribe(res=>{
      if(res.data){
        this.userList = res.data
      }
    })
  }

  onUpdateUser(userId : any){
    if(userId){
      this.router.navigate(['/profile/'+ userId]);
    }
  }

  onDeleteUser(userId : any){
    if(userId){
      Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: "คุณต้องการลบผู้ใช้นี้ใช่หรือไม่!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
    }).then((result)=>{
      if(result.isConfirmed){
        this.callService.deleteUserByUserId(userId).subscribe(res=>{
          if(res.data){
            Swal.fire({
              icon: 'success',
              title: 'ลบสำเร็จ',
              text: 'ผู้ใช้ถูกลบสำเร็จ',
              confirmButtonText: 'ตกลง'
          }).then(()=>{
            window.location.reload()
          })
          }
        })  
      }
    })}
  }

}
