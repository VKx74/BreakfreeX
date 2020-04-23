import {MatPaginatorIntl} from '@angular/material/paginator';
import {Injectable} from "@angular/core";

@Injectable()
export class MatPaginatorIntlCustom extends MatPaginatorIntl {
    nextPageLabel = '';
    previousPageLabel = '';
}
