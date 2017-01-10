import { Observable } from './Observable';
export declare type writer<T> = (currentValue: T) => T;
export declare class Origin<T> extends Observable<T> {
    constructor(defaultValue: T);
    push(nextValue: T | writer<T>): Promise<void>;
}
