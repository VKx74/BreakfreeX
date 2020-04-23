import {ModuleWithProviders, NgModule} from "@angular/core";

@NgModule({})
export class AlertModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AlertModule
    };
  }
}
