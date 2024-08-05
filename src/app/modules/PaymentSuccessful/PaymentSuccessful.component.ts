import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-PaymentSuccessful',
  templateUrl: './PaymentSuccessful.component.html',
  styleUrls: ['./PaymentSuccessful.component.css']
})
export class PaymentSuccessfulComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  SlipData : any

  ngOnInit() {
    const SlipDatails : any = sessionStorage.getItem("Slip")
    this.SlipData = JSON.parse(SlipDatails)

    console.log("DataSlip",this.SlipData)

  }


  navigateToHome(){
    sessionStorage.removeItem('Slip')
    this.router.navigate(['']);
  }
}
