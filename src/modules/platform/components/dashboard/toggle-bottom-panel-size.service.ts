import { Injectable } from '@angular/core';
import {IOutputAreaSizes} from "angular-split";

@Injectable()
export class ToggleBottomPanelSizeService {
  public splitVerticalAreaSizes: IOutputAreaSizes = [null, 40];

  constructor() { }

  sizePanel() {
    return this.splitVerticalAreaSizes[0];
  }

  sizeBottomPanel() {
    return this.splitVerticalAreaSizes[1];
  }

  setBottomPanelSize(size: number) {
    this.splitVerticalAreaSizes[1] = size;
  }
}
