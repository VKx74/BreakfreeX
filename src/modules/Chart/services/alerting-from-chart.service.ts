import { Inject, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Subscription } from 'rxjs';
import { ConfirmModalComponent } from 'modules/UI/components/confirm-modal/confirm-modal.component';
import { AlertService } from "@alert/services/alert.service";
import { AlertsService } from "modules/AutoTradingAlerts/services/alerts.service";
import { TranslateService } from "@ngx-translate/core";
import { AlertStatus, AlertType } from "modules/AutoTradingAlerts/models/EnumsDTO";
import { PriceAlertDialogComponent } from "modules/AutoTradingAlerts/components/price-alert-dialog/price-alert-dialog.component";
import { AlertCondition } from "modules/AutoTradingAlerts/models/Enums";
import { PriceAlert } from "modules/AutoTradingAlerts/models/AlertBase";


@Injectable()
export class AlertingFromChartService implements TradingChartDesigner.IAlertingFromChartHandler {
    private _chart: TradingChartDesigner.Chart;
    private _onAlertsChangedSubject: Subscription;

    constructor(@Inject(AlertService) protected _alertService: AlertService, protected _dialog: MatDialog, protected _alertsService: AlertsService, protected _translateService: TranslateService) {
        this._onAlertsChangedSubject = this._alertsService.onAlertsChanged.subscribe(() => {
            this.refresh();
        });
    }

    IsAlertingEnabledHandler(): boolean {
        return true;
    }

    Remove(id: any, callback: () => void): void {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                message: this._translateService.get('Stop alert?'),
                onConfirm: () => {
                    this._alertsService.stopAlert(id, AlertType.PriceAlert).subscribe(() => {
                        // this._alertService.success(this._translateService.get('alertRemoved'));
                    }, (error) => {
                        // this._alertService.error(this._translateService.get('failedToRemoveAlert'));
                        console.log(error);
                    });
                }
            }
        });
    }

    Edit(id: any, callback: () => void): void {
        const alert = this._alertsService.Alerts.find(_ => _.id === id);
        if (!alert && alert.type === AlertType.PriceAlert) {
            return;
        }

        this._dialog.open(PriceAlertDialogComponent, {
            data: { alert: alert }
        });
    }

    NewAlert(price: number): void {
        let lastPrice = this._chart.barDataRows().close.lastValue;

        this._dialog.open(PriceAlertDialogComponent, {
            data: {
                settings: {
                    instrument: this._chart.instrument,
                    price: Math.roundToDecimals(price, this._chart.instrument.pricePrecision),
                    condition: lastPrice > price ? AlertCondition.LessThan : AlertCondition.GreaterThan
                }
            }
        });
    }

    PriceChange(id: any, price: number, callback: () => void): void {
        let lastPrice = this._chart.barDataRows().close.lastValue;
        const alert = this._alertsService.Alerts.find(_ => _.id === id) as PriceAlert;
        if (!alert) {
            return;
        }
        let condition = lastPrice > price ? AlertCondition.LessThan : AlertCondition.GreaterThan;
        this._alertsService.updatePriceAlert({
            condition: condition,
            value: Math.roundToDecimals(price, this._chart.instrument.pricePrecision),
            exchange: alert.exchange,
            instrument: alert.instrument,
            notificationMessage: alert.notificationMessage,
            useEmail: alert.useEmail,
            usePush: alert.usePush,
            useSMS: alert.useSMS,
            expiring: alert.expiring
        }, id).subscribe(
            (result) => {
                callback();
                this._alertService.success("Alert modified");
            },
            (error) => {
                callback();
                this._alertService.error("Failed to modify alert");
                this.refresh();
            });
    }

    public dispose() {
        if (this._onAlertsChangedSubject) {
            this._onAlertsChangedSubject.unsubscribe();
            this._onAlertsChangedSubject = null;
        }
    }

    public setChart(chart: TradingChartDesigner.Chart) {
        if (this._chart !== chart) {
            this._chart = chart;
            this.refresh();
        }
    }

    public refresh() {
        if (!this._chart) {
            return;
        }

        this.clearChart();
        this.fillOrderLines();
    }

    private clearChart() {
        if (!this._chart) {
            return;
        }

        let shapes = [];
        for (const shape of this._chart.primaryPane.shapes) {
            if (shape instanceof TradingChartDesigner.ShapeAlertLine) {
                shape.locked = false;
                shape.selectable = true;
                shape.removable = true;
                shapes.push(shape);
            }
        }
        if (shapes.length) {
            this._chart.primaryPane.removeShapes(shapes);
            this._chart.commandController.clearCommands();
        }
    }

    private fillOrderLines() {
        if (!this._chart) {
            return;
        }

        const shapes = [];
        for (const alert of this._alertsService.Alerts) {
            if (alert.type !== AlertType.PriceAlert) {
                continue;
            }  
            
            if (alert.status !== AlertStatus.Running) {
                continue;
            }

            const priceAlert = alert as PriceAlert;

            if (priceAlert.instrument !== this._chart.instrument.id || priceAlert.exchange !== this._chart.instrument.exchange) {
                continue;
            }

            const alertShape = new TradingChartDesigner.ShapeAlertLine();
            alertShape.lineId = priceAlert.id;
            alertShape.lineText = "Alert";
            alertShape.linePrice = priceAlert.value;
            alertShape.isEditable = true;
            shapes.push(alertShape);
        }

        if (shapes.length) {
            this._chart.primaryPane.addShapes(shapes);
        }
    }
}
