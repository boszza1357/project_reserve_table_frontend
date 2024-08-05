import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  tables: any[] = [];
  imageBlobUrls: any[] = [];
  productImgList: any;
  productList: any;
  productTypeList: any = [];
  userDate : any;


  constructor(
    private callService: CallserviceService, 
    private sanitizer: DomSanitizer,
    private router : Router,
    private activated: ActivatedRoute 
  ) 
    
{}

  ngOnInit() {
    const userDetailSession: any = sessionStorage.getItem("userDetail");
    if (userDetailSession) {
      this.userDate = JSON.parse(userDetailSession);
      console.log("Date User",this.userDate);  
    }
    this.getProductTypeAll();
    this.callService.getAllProduct().subscribe(res => {
      console.log("API Response:", res);
      if (res.data) {
        this.productList = res.data;
        console.log("Product List:", this.productList); 
        for (let product of this.productList) {
          product.imgList = [];
          product.productType = this.productTypeList.filter((x: any) => x.tablesTypeId === product.tablesTypeId);
          // console.log(product.productType);
          this.callService.getProductImgByProductId(product.tablesId).subscribe((res) => {
            if (res.data) {
              this.productImgList = res.data;
              for (let productImg of this.productImgList) {
                this.getImage(productImg.tableImgName, product.imgList);
              }
            } else {
              window.location.reload();
            }
          });
        }
      }
    });
  }

  getImage(fileNames: any, imgList: any) {
    this.callService.getBlobThumbnail(fileNames).subscribe((res) => {
      let objectURL = URL.createObjectURL(res);       
      let imageBlobUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      imgList.push(imageBlobUrl);
    });
  }

  getProductTypeAll() {
    this.callService.getProductTypeAll().subscribe((res) => {
      if (res.data) {
        this.productTypeList = res.data;
      }
    });
  }

  // onShowProduct(tableId: any) {
  //   this.router.navigate(['/reservation/'+ tableId]);  
  // }

  // onReservation(tableId: any, tableTypeId: any ) {
  //   console.log('Navigating to reservation with tableId:', tableId, 'and tableTypeId:', tableTypeId); 
  //   this.router.navigate(['/reservation', tableId, tableTypeId]);  
  // }

  onReservation(tableId: any, tableTypeId: any ) {
    const userDetailSession: any = sessionStorage.getItem("userDetail");
    
    if (!userDetailSession) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาเข้าสู่ระบบ',
        text: 'คุณต้องล็อกอินเพื่อทำการจองโต๊ะ',
        confirmButtonText: 'ไปที่หน้าเข้าสู่ระบบ',
        confirmButtonColor: '#3085d6'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
    } else {
      console.log('Navigating to reservation with tableId:', tableId, 'and tableTypeId:', tableTypeId); 
      this.router.navigate(['/reservation', tableId, tableTypeId]);  
    }
  }
  

}
