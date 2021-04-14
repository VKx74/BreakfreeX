import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AutoTradingAlertsTranslateService } from 'modules/AutoTradingAlerts/localization/token';

@Component({
  selector: 'alert-setup-base',
  templateUrl: './alert-setup-base.component.html',
  styleUrls: ['alert-setup-base.component.scss']
})
export class AlertSetupBaseComponent {
  private _selectedTime: string;
  private _selectedDate: Date;
  private _expiration: number;

  @Input() canRunAlert: boolean = true;
  @Input() useExpiration: boolean = true;
  @Input() showPopup: boolean = true;
  @Input() sendSMS: boolean = false;
  @Input() sendEmail: boolean = false;
  @Input() saveAndStart: boolean = false;
  @Input() message: string = "";
  @Input() set expiration(value: number) {
    if (this._expiration !== value) {
      this._expiration = value;
      this._selectedDate = new Date(this._expiration);
      this._selectedTime = `${this._selectedDate.getHours()}:${this._selectedDate.getMinutes()}`;
      this.expirationChange.next(this._expiration);
    }
  }

  @Output() useExpirationChange = new EventEmitter<boolean>();
  @Output() showPopupChange = new EventEmitter<boolean>();
  @Output() sendSMSChange = new EventEmitter<boolean>();
  @Output() sendEmailChange = new EventEmitter<boolean>();
  @Output() saveAndStartChange = new EventEmitter<boolean>();
  @Output() messageChange = new EventEmitter<string>();
  @Output() expirationChange = new EventEmitter<number>();

  public minDate: Date = new Date();
  public maxDate: Date = new Date(new Date().getTime() + (1000 * 24 * 60 * 60 * 7));

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

  public get saveAndStartProp(): boolean {
    return this.saveAndStart && this.canRunAlert;
  }

  public get messageProp(): string {
    return this.message;
  }

  public set useExpirationProp(value: boolean) {
    this.useExpiration = value;
    this.useExpirationChange.next(this.useExpiration);
  }

  public set showPopupProp(value: boolean) {
    this.showPopup = value;
    this.showPopupChange.next(this.showPopup);
  }

  public set sendSMSProp(value: boolean) {
    this.sendSMS = value;
    this.sendSMSChange.next(this.sendSMS);
  }

  public set sendEmailProp(value: boolean) {
    this.sendEmail = value;
    this.sendEmailChange.next(this.sendEmail);
  }

  public set saveAndStartProp(value: boolean) {
    this.saveAndStart = value;
    this.saveAndStartChange.next(this.saveAndStart);
  }

  public set messageProp(value: string) {
    this.message = value;
    this.messageChange.next(this.message);
  }



  public set selectedTimeProp(value: string) {
    if (value) {
      this._selectedTime = value;
      this._setExpiration();
    }
  }

  public get selectedTimeProp(): string {
    return this._selectedTime;
  }

  public set selectedDateProp(value: Date) {
    if (value) {
      this._selectedDate = value;
      this._setExpiration();
    }
  }

  public get selectedDateProp(): Date {
    return this._selectedDate;
  }

  constructor(@Inject(AutoTradingAlertsTranslateService) private _translateService: TranslateService) {
  }

  ngOnInit() {
  }

  private _setExpiration() {
    const hourMin = this._selectedTime.split(":");
    let h = hourMin[0];
    let m = hourMin[1];

    if (h.length === 1) {
      h = `0${h}`;
    }
    if (m.length === 1) {
      m = `0${m}`;
    }

    let tz = this._selectedDate.toISOString().split(":")[2];
    let year = this._selectedDate.getFullYear();
    let day = this._selectedDate.getDate().toString();
    let month = (this._selectedDate.getMonth() + 1).toString();

    if (day.length === 1) {
      day = `0${day}`;
    }
    if (month.length === 1) {
      month = `0${month}`;
    }

    let dateString = `${year}-${month}-${day}`;
    let timeString = `${h}:${m}:${tz}`;
    let exp = new Date(`${dateString}T${timeString}`).getTime();
    let tzShift = new Date().getTimezoneOffset() * 60 * 1000;
    this.expiration = exp + tzShift;
  }
}
