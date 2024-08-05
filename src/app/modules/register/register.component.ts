import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-Register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(
    private callService : CallserviceService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activated: ActivatedRoute
  ) { }

  roleList : any = [];
  isPassword : Boolean = false;
  isSubmit: boolean = false;

  registerForm = this.formBuilder.group({
    fristName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    age: ['', Validators.required],
    gender: ['', Validators.required],
    roleId: ['', Validators.required],
    userName: ['', Validators.required],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required]
  })

  ngOnInit() {
    this.getAllRole();
  }

  getAllRole(){
    this.callService.getAllRole().subscribe(res =>{
      if(res){
        this.roleList = res;
      }
    })
  }

  onSubmit(){
    this.isSubmit = true;
    if (this.registerForm.invalid) {
      return;
    }
    this.isPassword = false
    console.log(this.registerForm.value)
    if(this.passwordValidate()){
      const data = this.registerForm.value;
        Swal.fire({
          title: 'ต้องการสมัครสมาชิก?',
          text: "คุณต้องการสมัครสมาชิกใช่หรือไม่!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#56C596',
          cancelButtonColor: '#d33',
          confirmButtonText: 'บันทึก',
          cancelButtonText: 'ยกเลิก'
        }).then((result) => {
          if (result.isConfirmed) {
            this.callService.saveRegister(data).subscribe(res =>{
              if(res.data){
                Swal.fire({
                  icon: 'success',
                  title: 'สำเสร็จ',
                  text : 'สมัครสมาชิกสำเสร็จ',
                  confirmButtonText:'ตกลง'
                });
                this.router.navigate(['/login']);
              }else{
                Swal.fire({
                  icon : 'warning',
                  title :'บันทึกข้อมูลไม่สำเสร็จ',
                  text :'โปรดตรวจข้อมูลใหม่อีครั้ง',
                  confirmButtonText: 'ตกลง'
                });
              }
            })
          }
        });
      }
  }

  passwordValidate(){
    const password = this.registerForm.value.password;
    const confirmPassword = this.registerForm.value.confirmPassword;

    if(password != confirmPassword){
      this.isPassword = true;
      Swal.fire({
        icon: 'error',
        title: 'รหัสผ่านไม่ตรงกัน',
        text: 'โปรดตรวจสอบรหัสผ่านและยืนยันรหัสผ่านให้ตรงกัน',
        confirmButtonText: 'ตกลง'
      });
      return false;
    }else{
      return true;
    }
  }

  setSubmit(){
    this.isSubmit = false;
  }

}
