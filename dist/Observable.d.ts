import { BaseObservable } from './BaseObservable';
export declare class Observable<T> extends BaseObservable<T> {
    static of<T>(...values: T[]): Observable<T>;
    static from<T>(values: Observable<T> | Iterable<T>): Observable<T>;
    map<U>(action: (value: T) => U): Observable<U>;
    flatten<U>(this: Observable<Observable<U>>): Observable<U>;
    scan<U>(reductor: (value: T, summary: U) => U): Observable<U>;
    filter(filter: (value: T) => boolean): Observable<T>;
    bufferCount(bufferSize: number, customBufferCount?: number): Observable<T[]>;
    buffer(maxLastMessages?: number): Observable<T[]>;
}
