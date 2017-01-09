import { Observable } from './Observable';
export declare class Merge<T extends Object> extends Observable<T> {
    constructor(sources: {
        [id: string]: Observable<any>;
    });
}
