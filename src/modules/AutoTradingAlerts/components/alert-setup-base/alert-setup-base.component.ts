import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AutoTradingAlertsTranslateService } from 'modules/AutoTradingAlerts/localization/token';

@Component({
  selector: 'alert-setup-base',
  templateUrl: './alert-setup-base.component.html',
  styleUrls: ['alert-setup-base.component.scss']
})
export class AlertSetupBaseComponent {

  minDate = new Date;

  @Input() useExpiration: boolean = false;
  @Input() showPopup: boolean = true;
  @Input() sendSMS: boolean = false;
  @Input() sendEmail: boolean = false;
  @Input() message: string = "";

  @Output() useExpirationChanged = new EventEmitter<boolean>();
  @Output() showPopupChanged = new EventEmitter<boolean>();
  @Output() sendSMSChanged = new EventEmitter<boolean>();
  @Output() sendEmailChanged = new EventEmitter<boolean>();
  @Output() messageChanged = new EventEmitter<string>();

  public get useExpirationProp(): boolean {
    return this.useExpiration;
  }
  
  public get showPopupProp(): boolean {
    return this.showPopup;
  }
  
  public get sendSMSProp(): boolean {
    return this.sendSMS;
  }

  public get sendEmailProp(): boolean {
    return this.sendEmail;
  }

  public get messageProp(): string {
    return this.message;
  }

  public set useExpirationProp(value: boolean) {
    this.useExpiration = value;
    this.useExpirationChanged.next(this.useExpiration);
  }
  
  public set showPopupProp(value: boolean) {
    this.showPopup = value;
    this.showPopupChanged.next(this.showPopup);
  }
  
  public set sendSMSProp(value: boolean) {
    this.sendSMS = value;
    this.sendSMSChanged.next(this.sendSMS);
  }

  public set sendEmailProp(value: boolean) {
    this.sendEmail = value;
    this.sendEmailChanged.next(this.sendEmail);
  }

  public set messageProp(value: string ) {
    this.message = value;
    this.messageChanged.next(this.message);
  }

  constructor(@Inject(AutoTradingAlertsTranslateService) private _translateService: TranslateService) {
  }

  ngOnInit() {
  }
}
