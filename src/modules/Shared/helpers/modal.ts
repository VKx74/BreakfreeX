import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Injector} from "@angular/core";

export abstract class Modal<ModalDataType = any, ModalResultType = any> {
    dialogRef: MatDialogRef<any>;
    data: ModalDataType;

    protected constructor(injector: Injector) {
        this.dialogRef = injector.get(MatDialogRef);
        this.data = injector.get(MAT_DIALOG_DATA);
        this.dialogRef
    }

    close(result?: ModalResultType) {
        this.dialogRef.close(result);
    }
}
