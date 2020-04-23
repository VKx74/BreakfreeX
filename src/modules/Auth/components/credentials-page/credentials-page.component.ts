import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {passwordsMatchValidator, passwordValidator} from "Validators";
import {RegisterUserModel, Roles} from "@app/models/auth/auth.models";
import {UrlsManager} from "@app/Utils/UrlManager";
import {AuthRoutes} from "../../auth.routes";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthenticationService} from "@app/services/auth/auth.service";
import {CrossFieldErrorMatcher} from "@app/Utils/crossFieldErrorMatcher";

@Component({
  selector: 'credentials-page',
  templateUrl: './credentials-page.component.html',
  styleUrls: ['./credentials-page.component.scss']
})
export class CredentialsPageComponent implements OnInit {
  processing = false;
  serverError: string;
  registerFormGroup: FormGroup;
  errorMatcher = new CrossFieldErrorMatcher();

  constructor(private _router: Router,
              private _route: ActivatedRoute,
              private _formBuilder: FormBuilder,
              private _authService: AuthenticationService) {

    this.registerFormGroup = this._formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, passwordValidator()]),
      confirmPassword: new FormControl('', [Validators.required]),
      acceptPolicy: new FormControl('', [Validators.requiredTrue])
    }, {
      validators: [passwordsMatchValidator('password', 'confirmPassword')]
    });
  }

  ngOnInit() {
  }

  doRegistration() {
    const formControls = this.registerFormGroup.controls;
    const email = formControls['email'].value;
    const model: RegisterUserModel = {
      email: email,
      password: formControls['password'].value,
      role: Roles.User.toString(),
      redirectUri: UrlsManager.registrationRedirectUrl(email)
    };

    this.processing = true;
    this.serverError = null;

    this._authService.registerUser(model).subscribe(
        data => {
          this.processing = false;
          this._router.navigate([AuthRoutes.Confirming], {
            relativeTo: this._route.parent,
            queryParams: {email: email}
          });
        },
        error => {
          this.processing = false;
          this.serverError = 'Registration failed: ' + error.error.description;
        });
  }

  doLogin() {
    this._router.navigate([AuthRoutes.Login], {relativeTo: this._route.parent});
  }

}
