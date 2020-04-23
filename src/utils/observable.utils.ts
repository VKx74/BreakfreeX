import {forkJoin, Observable} from "rxjs";
import {map, take} from "rxjs/operators";

export interface ObservableMap {
    [key: string]: Observable<any>;
}

export class ObservableUtils {
    static observableMap<T = any>(obsMap: ObservableMap): Observable<T> {
        const resultMap = {} as T;
        const keys = Object.keys(obsMap);

        return forkJoin(keys.map((key: string) => {
            return obsMap[key]
                .pipe(
                    map((value) => {
                        resultMap[key] = value;
                        return true;
                    })
                );
        }))
            .pipe(
                map(() => resultMap)
            );
    }

    static instant<T = any>(observable: Observable<T>): T {
        let value = null;

        observable
            .pipe(take(1))
            .subscribe((v: T) => {
                value = v;
            });

        return value;
    }
}
