// import {Component, ElementRef, ViewChild} from '@angular/core';
//
// @Component({
//     selector: 'add-link-modal',
//     templateUrl: 'add-link-modal.component.html',
//     styleUrls: ['add-link-modal.component.scss']
// })
//
// export class AddLinkModalComponent {
//     @ViewChild('linkInput', {static: false}) linkInput: ElementRef;
//     onLinkSubmitted: (link: string) => void;
//     visible: boolean;
//
//     onInput(event) {
//         if (event.keyCode === 13) {
//             event.preventDefault();
//             this.submit();
//         }
//     }
//
//     submit() {
//         const link = this.linkInput.nativeElement.value.trim();
//
//         if (link.length > 0) {
//             this.onLinkSubmitted(link);
//         }
//
//         this.cancel();
//     }
//
//     cancel() {
//         this.visible = false;
//     }
// }
