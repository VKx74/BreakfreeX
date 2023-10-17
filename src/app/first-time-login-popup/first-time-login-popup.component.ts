import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'first-time-login-popup',
  templateUrl: './first-time-login-popup.component.html',
  styleUrls: ['./first-time-login-popup.component.scss']
})
export class FirstTimeLoginPopupComponent implements OnInit {

  constructor() {

   }

  ngOnInit() {

  }
  openNeuralTradingAcademy() {
    window.open('https://breakfreetrading.com/neural-setup', '_blank');
  }

  openNeural() {
    window.open('https://breakfreetrading.com/neural', '_blank');
  }
}
