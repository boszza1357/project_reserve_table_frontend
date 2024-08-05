import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manageProduct',
  templateUrl: './manageProduct.component.html',
  styleUrls: ['./manageProduct.component.css']
})
export class ManageProductComponent implements OnInit {

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

 ngOnInit() {
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

  onDeleteProduct(tableId : any){
    if(tableId){
      Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
      text: "คุณต้องการลบสินค้านี้ใช่หรือไม่!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ยืนยัน!',
      cancelButtonText: 'ยกเลิก'
      }).then((result)=>{
        if(result.isConfirmed){
          this.callService.deleteProduct(tableId).subscribe(res=>{""
            if(res.data){
              Swal.fire({
                icon: 'success',
                title: 'ลบสำเร็จ',
                text: 'สินค้าถูกลบสำเร็จ',
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

  onUpdateProduct(tableId: any) {
    this.router.navigate(['/product/' + tableId]);  
  }
}
