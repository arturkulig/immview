import { Observable } from './Observable';
export declare type writer<T> = (currentValue: T) => T;
export declare class Data<T> extends Observable<T> {
    constructor(defaultValue: T);
    write(nextValue: T | writer<T>): Promise<void>;
}
