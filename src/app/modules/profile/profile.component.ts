import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { CallserviceService } from '../services/callservice.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(
    private formBuilder : FormBuilder,
    private callService : CallserviceService,
    private router : Router,
    private activated: ActivatedRoute,
  ) { }

  userDetail : any
  roleList : any
  userId : any
  title : any

  updateForm = this.formBuilder.group({
    fristName : '',
    lastName : '',
    phone : '',
    email : '',
    age : '',
    roleId : '',
    userName : '',
    gender : '',
  })

  ngOnInit() {
    this.getAllRole();
    this.userId = this.activated.snapshot.paramMap.get("userId");
    if(this.userId){
      this.callService.getByUserId(this.userId).subscribe(res=>{
        if( res.data){
          console.log(res.data)
          this.title = "โปรไฟล์ของคุณ"
          this.userDetail = res.data
          this.setDataForm(this.userDetail)
        }
      })
    }else{
      this.title = "โปรไฟล์ แอดมิน"
      let userDetailSession : any = sessionStorage.getItem("userDetail")
      this.userDetail = JSON.parse(userDetailSession)
      this.setDataForm(this.userDetail)
    }
    
  }

  setDataForm(data : any){
    this.updateForm.patchValue({
      fristName : data.fristName,
      lastName : data.lastName,
      phone : data.phone,
      email : data.email,
      age : data.age,
      roleId : data.roleId,
      userName : data.userName,
      gender : data.gender
    })
  }
  
  getAllRole(){
    this.callService.getAllRole().subscribe(res =>{ 
      if(res){
        this.roleList = res;
      }
    })
  }

  onSubmit(){
    console.log(this.updateForm.value)

    const data = this.updateForm.value
    
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: "คุณต้องการแก้ไขโปรไฟล์นี้ใช่หรือไม่!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'แก้ไข',
      cancelButtonText: 'ยกเลิก'
  }).then((result)=>{
    if (result.isConfirmed){
      this.callService.updateProfile(data, this.userDetail.userId).subscribe(res=>{
        console.log(res);
        if(res.data){
  
          Swal.fire({
            icon: 'success',
            title: 'แก้ไขสำเร็จ!',
            text: 'แก้ไขโปรไฟล์สำเสร็จเรียบร้อย',
            confirmButtonText: 'ตกลง',
          });
          if(this.userId){
            this.router.navigate(['/manage-user']);
          }else{
            this.getUserById(res.data)
            this.router.navigate(['']);
          }
        }else{
          Swal.fire({
            icon: 'warning',
            title: 'แก้ไขโปรไฟล์ไม่สำเสร็จ!',
            text: 'กรุณาตรวจสอบข้อมูล ด้วยค่ะ',
            confirmButtonText: 'ตกลง',
          });
        }
      })
    }
  })
  }

  getUserById(userId : any){
    this.callService.getByUserId(userId).subscribe(res=>{
      if(res.data){
        this.setDataForm(res.data)
        sessionStorage.removeItem("userDetail")
        sessionStorage.setItem("userDetail" , JSON.stringify(res.data))
      }
    })
  }

}
