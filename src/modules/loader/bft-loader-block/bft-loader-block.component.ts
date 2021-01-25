import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'bft-loader-block',
  templateUrl: './bft-loader-block.component.html',
  styleUrls: ['./bft-loader-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BFTLoaderBlockComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
