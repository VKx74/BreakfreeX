import {Component, Injector} from '@angular/core';
import {DataFeedBase} from "../../../Chart/datafeed/DataFeedBase";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Modal} from "Shared";
import {TranslateService} from "@ngx-translate/core";
import {HistoryStorageTranslateService} from "../../localization/token";
import {TimeFrameHelper} from "../../../../app/helpers/timeFrame.helper";
import {IHistoryRequest} from "@app/models/common/historyRequest";
import {IInstrument} from "@app/models/common/instrument";
import {HistoryUploaderService} from "../../services/history.uploader.service";
import {AlertService} from "@alert/services/alert.service";
import {HistoryStorageDTO} from "../../models/history.storage.dto";
import {ITimeFrame} from "@app/models/common/timeFrame";

interface IFormValues {
    symbol: IInstrument;
    timeframe: ITimeFrame;
    name: string;
    description: string;
    fromDate: Date;
    toDate: Date;
}

@Component({
    selector: 'load-datafeed-history',
    templateUrl: './load-datafeed-history.component.html',
    styleUrls: ['./load-datafeed-history.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: HistoryStorageTranslateService
        }
    ]
})
export class LoadDatafeedHistoryComponent extends Modal<any, HistoryStorageDTO> {
    allowedTimeframes: ITimeFrame[] = DataFeedBase.supportedTimeFrames;
    useDateRange: boolean = true;
    formGroup: FormGroup;
    processing: boolean;


    constructor(injector: Injector,
                private _historyUploader: HistoryUploaderService,
                private _alertService: AlertService,
                private _timeFrameHelper: TimeFrameHelper,
                private _translateService: TranslateService) {
        super(injector);
    }

    ngOnInit() {
        this.formGroup = this._createFormGroup();
    }

    timeFrameCaption = (timeFrame: ITimeFrame) => {
        return this._timeFrameHelper.timeFrameToStr(timeFrame);
    }

    private _createFormGroup(): FormGroup {
        return new FormGroup({
            symbol: new FormControl(null, [Validators.required]),
            timeframe: new FormControl(DataFeedBase.supportedTimeFrames[0]),
            // barsCount: new FormControl(500, [Validators.min(300)]),
            name: new FormControl('', [Validators.required]),
            description: new FormControl('', [Validators.required]),
            fromDate: new FormControl({value: new Date(), disabled: !this.useDateRange}, [Validators.required]),
            toDate: new FormControl({value: new Date(), disabled: !this.useDateRange}, [Validators.required])
        });
    }

    handleUseDateRangeChange(useDateRange: boolean) {
        const controls = this.formGroup.controls;
        const fromDateControl = controls['fromDate'];
        const toDateControl = controls['toDate'];
        const barsCountControl = controls['barsCount'];

        this.useDateRange = useDateRange;

        if (!useDateRange) {
            fromDateControl.disable();
            toDateControl.disable();

            barsCountControl.enable();
        } else {
            barsCountControl.disable();

            fromDateControl.enable();
            toDateControl.enable();
        }
    }

    submit() {
        const formValues = this.formGroup.value as IFormValues;
        const historyRequest: IHistoryRequest = {
            instrument: formValues.symbol,
            startDate: formValues.fromDate,
            endDate: formValues.toDate,
            timeFrame: formValues.timeframe
        };

        this.processing = true;
        this._historyUploader.uploadHistory(historyRequest, formValues.description, formValues.name)
            .subscribe((value: HistoryStorageDTO) => {
                this.processing = false;
                this._alertService.success(this._translateService.get('loadHistory.snapshotSaved'));

                this.close(value);
            }, error => {
                this._alertService.error(error);
                this.processing = false;
            });
    }

}
