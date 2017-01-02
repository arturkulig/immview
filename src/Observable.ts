import { BaseObservable } from './BaseObservable'

export class Observable<T> extends BaseObservable<T> {
    map<U> (functor: (value: T) => U): Observable<U> {
        throw new Error('not implemented')
    }

    reduce<U> (reductor: (value: T, summary: U) => U): Observable<U> {
        throw new Error('not implemented')
    }

    filter (filter: (value: T) => boolean): Observable<T> {
        throw new Error('not implemented')
    }

    scan<U> (scanner: (values: T[]) => U, historyLength = 2, defaultValue = null): Observable<U> {
        throw new Error('not implemented')
    }
}