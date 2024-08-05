import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-updateProduct',
  templateUrl: './updateProduct.component.html',
  styleUrls: ['./updateProduct.component.css']
})
export class UpdateProductComponent implements OnInit {

  constructor(
    private callService : CallserviceService,
    private formBuilder : FormBuilder,
    private router : Router,
    private activated: ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) { }

  productTypeList : any
  tableId : any
  productImgList : any
  imageBlobUrl : any 
  ImageList : any = []
  image : any
  selectedFiles : any =[]
  delFile : any = []

  updateProductForm = this.formBuilder.group({
    tablesId : '',
    tablesTypeId : '',
    tableName : '',
    tableNumber : '',
    status : '',
    tableDesc : '',
    capacity : 0,
    price : parseFloat('0').toFixed(2),
    files : [],
    nots : ''
  })

  ngOnInit() {
    this.getProductTypeAll();
    this.tableId = this.activated.snapshot.paramMap.get("tableId"); 
    this.callService.getProductByProductId(this.tableId).subscribe((res) => {
      if(res.data){
        this.setDataForm(res.data)

        // ดึงภาพ
        this.callService.getProductImgByProductId(res.data.tablesId).subscribe((res) => {
          if(res.data){
            this.productImgList = res.data
            for(let productImg of this.productImgList){
              this.getImage(productImg.tableImgName)
            }
          }else{
            window.location.reload()
          }
        });
      }
    })
  }

  setDataForm(data : any){
    this.updateProductForm.patchValue({
      tableName : data.tableName,
      tableNumber : data.tableNumber,
      price : data.price,
      capacity : data.capacity,
      status : data.status,
      tablesTypeId : data.tablesTypeId,
      tablesId : data.tablesId,
      tableDesc : data.tableDesc,
      nots  : data.nots

    })
  }

  onSubmit(){
    const data = this.updateProductForm.value
    this.callService.updateProduct(data, this.tableId).subscribe(res=>{
      if(res.data){

        if(this.delFile){
          for(let fileName of this.delFile){
            this.callService.deleteImage(fileName).subscribe(res=>{
              console.log("deleteImage =>")
            });
          }
        }
        if(this.selectedFiles[0]){
          for(const file of this.selectedFiles[0]){
            const formData = new FormData();
            formData.append('file', file); 
            this.callService.saveImage(formData, res.data).subscribe(res=>{
              console.log("saveImage=>" , res.data)
            })
          }
        }
        if(res.data){
          Swal.fire({
            icon: 'success',
            title: 'สำเร็จ!',
            text: 'บันทึกข้อมูลสำเร็จ',
            confirmButtonText: 'ตกลง',
          }).then(res=>{
            if(res.isConfirmed){
              this.router.navigate(['/manage-product']);
            }
          })
          
        }else{
          Swal.fire({
            icon: 'warning',
            title: 'บันทึกไม่สำเร็จ!',
            text: 'กรุณาตรวจสอบข้อมูล ด้วยค่ะ',
            confirmButtonText: 'ตกลง',
          });
        }

      }
    })
  }

  getProductTypeAll(){
    this.callService.getProductTypeAll().subscribe((res) => {
      if(res.data){
        this.productTypeList = res.data
      }
    });
  }

  getImage(fileNames : any){
    this.callService.getImageByte(fileNames).subscribe((res) => {
      let objectURL = URL.createObjectURL(res);       
      this.imageBlobUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      this.ImageList.push({
        key : fileNames,
        value : this.imageBlobUrl
      } )
    });
  }

  onFileChanged(event: any) {
    this.selectedFiles.push(event.target.files);
    console.log(" this.selectedFiles",  this.selectedFiles)
  }

  onDeleteFileChanged(fileName: any) {
    let dataList = []
    for(let image of  this.ImageList){
      if(image.key != fileName){
        dataList.push(image);
      }else{
        this.delFile.push(image.key);
      }
    }
    this.ImageList = dataList;
    console.log(" this.delFile",  this.delFile)
  }

}
