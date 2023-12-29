import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-link-modal',
  template: `<iframe width="100%" height="100%" [src]="data.link | safeUrl"></iframe>`,
})
export class LinkModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { link: string }) {}
}