import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'bft-loader',
  templateUrl: './bft-loader.component.html',
  styleUrls: ['./bft-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BFTLoaderComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
