import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashbordAdmin',
  templateUrl: './dashbordAdmin.component.html',
  styleUrls: ['./dashbordAdmin.component.css']
})
export class DashbordAdminComponent implements OnInit {

  constructor(
    private callService : CallserviceService,
    private sanitizer: DomSanitizer,
    private router : Router,
  ) { 
  }

  imageBlobUrl : any 
  imageBlobUrls : any = []
  productImgList : any
  productList : any
  productTypeList : any= []
  userDetail : any 

  
  ngOnInit() {

    var userDetailSession : any = sessionStorage.getItem("userDetail")
    this.getProductTypeAll();
    this.callService.getAllProduct().subscribe(res=>{
      console.log("API Response:", res);
      if(res.data){
        this.productList = res.data
        console.log("Product List:", this.productList); 
        for(let product of this.productList){
          product.imgList = []
          product.productType = this.productTypeList.filter((x : any)  => x.tablesTypeId === product.tablesTypeId);
          console.log(product.productType)
          this.callService.getProductImgByProductId(product.tablesId).subscribe((res) => {
            if(res.data){
              this.productImgList = res.data
              for(let productImg of this.productImgList){
                this.getImage(productImg.tableImgName, product.imgList);
              }
            }else{
              window.location.reload()
            }
          });
          
        }
      }
    }) 
    this.userDetail = JSON.parse(userDetailSession)
  }

 
  countStatus(status: string): number {
    if (!this.productList) {
      return 0;
    }
    return this.productList.filter((product: any) => product.status === status).length;
  }

 

  getImage(fileNames : any ,  imgList : any){
    this.callService.getBlobThumbnail(fileNames).subscribe((res) => {
        let objectURL = URL.createObjectURL(res);       
        this.imageBlobUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        imgList.push(this.imageBlobUrl)
    });
  }

  getProductTypeAll(){
    this.callService.getProductTypeAll().subscribe((res) => {
      if(res.data){
        this.productTypeList = res.data
      }
    });
  }


}
