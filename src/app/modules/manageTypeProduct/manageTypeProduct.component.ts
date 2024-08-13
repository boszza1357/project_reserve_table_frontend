import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manageTypeProduct',
  templateUrl: './manageTypeProduct.component.html',
  styleUrls: ['./manageTypeProduct.component.css']
})
export class ManageTypeProductComponent implements OnInit {

  constructor(
    private callService : CallserviceService,
    private sanitizer: DomSanitizer,
    private router : Router,
  ) { }

  ngOnInit() {
    this.callService.getProductTypeAll().subscribe((res)=>{
      if(res.data){
        const getAllTypeDate = res.data
      }
    })
  }


}