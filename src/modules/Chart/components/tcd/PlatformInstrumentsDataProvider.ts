import { IInstrument } from "@app/models/common/instrument";
import { MatDialog } from '@angular/material/dialog';
import { InstrumentSearchDialogComponent } from "@instrument-search/components/instrument-search-dialog/instrument-search-dialog.component";

export class PlatformInstrumentsDataProvider implements TradingChartDesigner.InstrumentsDataProvider {

    constructor(private _dialog: MatDialog) {
    }


    getInstrument(chart: TradingChartDesigner.Chart): Promise<IInstrument> {
        return new Promise((resolve, reject) => {
            this._dialog.open(InstrumentSearchDialogComponent, {
                data: {
                    instrument: chart.instrument as IInstrument
                }
            }).afterClosed().subscribe((data) => {
                resolve(data);
            });
        });

    }

}
