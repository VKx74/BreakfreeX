import {Component, OnInit} from '@angular/core';
import {AppConfigService} from "@app/services/app.config.service";
import {forkJoin, of} from "rxjs";
import {catchError, tap} from "rxjs/operators";
import {ServiceHealthStatusResponse, SystemMonitoringService} from "../../../services/system-monitoring.service";

export enum ServiceStatus {
    Error,
    Success,
}

interface IHealthCheckService {
    name?: string;
    displayName: string;
    status: ServiceStatus;
    description: string;
    url: string;
}

@Component({
    selector: 'services-health-check',
    templateUrl: './services-health-check.component.html',
    styleUrls: ['./services-health-check.component.scss'],
})
export class ServicesHealthCheckComponent implements OnInit {
    static readonly SERVICE_SUCCESS_DESCRIPTION = 'Service running smoothly';
    readonly MAX_TOOLTIP_LENGTH = 300;
    readonly SHOW_TOOLTIP_AFTER = 70;
    services: IHealthCheckService[];
    ServiceStatus = ServiceStatus;
    apiUrls = AppConfigService.apiUrls;
    loading = false;

    constructor(private _appConfigService: AppConfigService, private _systemMonitoringService: SystemMonitoringService) {
    }

    ngOnInit() {
        this.services = this.getDefaultServices();
        this.healthCheck(this.services);
    }

    private healthCheck(services: IHealthCheckService[]): void {
        this.loading = true;
        forkJoin(
            services.map((service: IHealthCheckService) => {
                return this._systemMonitoringService.checkStatus(service.url)
                    .pipe(
                        tap((resp: ServiceHealthStatusResponse) => {
                            service.status = ServiceStatus.Success;
                            service.description = ServicesHealthCheckComponent.SERVICE_SUCCESS_DESCRIPTION;
                        }),
                        catchError((e) => {
                            service.status = ServiceStatus.Error;

                            if (e.status === 500) {
                                service.description = this.getErrorDescription(e);
                            } else if (e.status === 404) {
                                service.description = 'Health Check endpoint is not provided';
                            } else {
                                service.description = 'Unknown Error';
                            }

                            return of(e);
                        })
                    );
            })
        ).subscribe(() => this.loading = false);
    }

    getErrorDescription(e) {
        let description = '';

        if (!e) return description;

        if (e.description) {
            description = e.description;
        } else if (e.error && e.error.description) {
            let descriptionObj = JSON.parse(e.error.description);

            for (let desc in descriptionObj) {
                if (descriptionObj.hasOwnProperty(desc)) {
                    description += `${desc}: ${descriptionObj[desc]} `;
                }
            }
        } else if (e.error) {
            for (let desc in e.error) {
                if (e.error.hasOwnProperty(desc)) {
                    description += `${desc}: ${e.error[desc]} `;
                }
            }
        }

        return description;
    }

    getDefaultServices(): IHealthCheckService[] {
        const healthCheckUrls = AppConfigService.servicesHealthCheckUrls || {};
        const servicesNames = Object.keys(healthCheckUrls);

        return servicesNames.filter(name => !!name)
            .map(name => {
                return {
                    name,
                    displayName: AppConfigService.servicesHealthCheckUrls[name].name,
                    url: AppConfigService.servicesHealthCheckUrls[name].url,
                    status: ServiceStatus.Success,
                    description: '',
                };
            });
    }

}
