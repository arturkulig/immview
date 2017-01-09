import { BaseObservable } from './BaseObservable';
export declare class Observable<T> extends BaseObservable<T> {
    static of<T>(...values: T[]): Observable<T>;
    static from<T>(values: Observable<T> | Iterable<T>): Observable<T>;
    map<U>(action: (value: T) => U): Observable<U>;
    flatMap<U>(action: (value: T) => Observable<U>): Observable<U>;
    reduce<U>(reductor: (value: T, summary: U) => U): Observable<U>;
    filter(filter: (value: T) => boolean): Observable<T>;
    scan<U>(scanner: (values: T[]) => U, historyLength?: number, defaultValue?: any): Observable<U>;
    buffer(maxLastMessages?: number): Observable<T[]>;
}
