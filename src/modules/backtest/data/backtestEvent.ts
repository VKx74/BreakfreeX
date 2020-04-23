export enum BacktestEventype {
    started = 'started',
    progress = 'progress',
    stopped = 'stopped',
    failed = 'failed',
    finished = 'finished'
}
export class BacktestEvent {
    data?: any;
    type: BacktestEventype;
}
