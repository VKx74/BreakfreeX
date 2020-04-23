import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AlertService} from "../../../Alert/services/alert.service";
import {ConfirmModalComponent} from "UI";
import {AuthenticationService} from "../../../../app/services/auth/auth.service";
import {IdentityService} from "../../../../app/services/auth/identity.service";
import {MatDialog} from "@angular/material/dialog";
import {UrlsManager} from "@app/Utils/UrlManager";
import {ComponentIdentifier} from "@app/models/app-config";

@Component({
  selector: 'auth-settings',
  templateUrl: './auth-settings.component.html',
  styleUrls: ['./auth-settings.component.scss']
})
export class AuthSettingsComponent implements OnInit {
  processing = false;
  confirmation = false;
  activated = false;
  confirmationPin = '';
  deactivatePin = '';
  QRCodeLink = 'http://chart.json.apis.google.com/chart.json?cht=qr&chs=300x300&chl=otpauth%3A%2F%2Ftotp%2Ftest%40test.com%3Fsecret%3DMFRGCYLBMFQWCYLB';


    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

  get verifyActive(): boolean {
      return this.processing || this.confirmationPin.length !== 6;
  }

  get deactivateActive(): boolean {
      return this.processing || this.deactivatePin.length !== 6;
  }

  constructor(private alertService: AlertService,
              private _dialog: MatDialog,
              private authService: AuthenticationService,
              private identity: IdentityService) {
      this.processing = false;
      this.activated = this.identity.isTwoFactorAuthEnable;
  }

  ngOnInit() {
  }

  close() {
        this.confirmation = !this.confirmation;
  }

  off() {
        this.confirmation = !this.confirmation;
  }

  activate() {
      this.processing = true;
      this.authService.enable2FactorAuth({
          email: this.identity.email
      }).subscribe(value => {
          this.QRCodeLink = value.qrCodeUrl;
          this.processing = false;
          this.confirmation = true;
      }, error => {
          this.processing = false;
          console.log(error);
          let errorText = error.statusText;
          if (typeof error.error === 'string') {
              errorText = error.error;
          }
          this.alertService.error('Failed to enable 2 factor authentication. ' + errorText, 'Authenticator');
      });
  }

  deactivate() {
      this.processing = true;
      this.authService.disable2FactorAuth({
          email: this.identity.email,
          pin: this.deactivatePin
      }).subscribe(value => {
          if (value) {
              this.activated = false;
              this.confirmation = false;
              this.identity.refreshTokens().subscribe(value1 => {
                  if (!this.identity.isAuthorized) {
                      location.reload();
                  }
              }, error1 => {
                  location.reload();
              });
          } else {
              console.log(value);
              this.alertService.error('Failed to disable 2 factor authentication', 'Authenticator');
          }
          this.processing = false;
      }, error => {
          this.processing = false;
          console.log(error);
          let errorText = error.statusText;
          if (typeof error.error === 'string') {
              errorText = error.error;
          }
          this.alertService.error('Failed to disable 2 factor authentication. ' + errorText, 'Authenticator');
      });
  }

  verify() {
      this.processing = true;
      this.authService.confirmEnable2FactorAuth({
          email: this.identity.email,
          pin: this.confirmationPin
      }).subscribe(value => {
          if (value) {
              this.activated = true;
              this.identity.refreshTokens().subscribe(value1 => {
                  if (!this.identity.isAuthorized) {
                      location.reload();
                  }
              }, error1 => {
                  location.reload();
              });
          } else {
              console.log(value);
              this.alertService.error('Failed to verify authentication code', 'Authenticator');
          }
          this.processing = false;
      }, error => {
          this.processing = false;
          console.log(error);
          let errorText = error.statusText;
          if (typeof error.error === 'string') {
              errorText = error.error;
          }
          this.alertService.error('Failed to verify authentication code. ' + errorText, 'Authenticator');
      });
  }

  reset() {
      this._dialog.open(ConfirmModalComponent, {
          data: {
              message: "Do you want reset your 2 step authentication secret? " +
              "Reset details will be send on your registration email.",
              onConfirm: () => { this._processReset(); }
          }
      } as any)
          .afterClosed();
  }

  private _processReset() {
      this.processing = true;
      this.authService.restore2FactorAuth({
          email: this.identity.email,
          redirectUrl: UrlsManager.restore2FactorAuthRedirectUrl(this.identity.email)
      }).subscribe (
          data => {
              this.alertService.info("Reset details sent on your registration email.", "Authenticator");
              this.processing = false;
              this.identity.refreshTokens().subscribe(value1 => {
                  if (!this.identity.isAuthorized) {
                      location.reload();
                  }
              }, error1 => {
                  location.reload();
              });
          },
          error => {
              this.processing = false;
              console.log(error);
              let errorText = error.statusText;
              if (typeof error.error === 'string') {
                  errorText = error.error;
              }
              this.alertService.error('Failed to reset authentication secret. ' + errorText, 'Authenticator');
          });
  }
}
