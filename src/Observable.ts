import { BaseObservable } from './BaseObservable'
import { DispatcherPriorities } from './DispatcherPriorities'
import { Dispatcher } from './DispatcherInstance'

export class Observable<T> extends BaseObservable<T> {
    map<U>(action: (value: T) => U): Observable<U> {
        throw new Error('not implemented')
    }

    flatMap<U>(action: (value: T) => Observable<U>): Observable<U> {
        throw new Error('not implemented')
    }

    reduce<U>(reductor: (value: T, summary: U) => U): Observable<U> {
        throw new Error('not implemented')
    }

    filter(filter: (value: T) => boolean): Observable<T> {
        throw new Error('not implemented')
    }

    scan<U>(scanner: (values: T[]) => U, historyLength = 2, defaultValue = null): Observable<U> {
        throw new Error('not implemented')
    }

    buffer(maxMessages: number = 0): Observable<T> {
        throw new Error('not implemented')
    }
}
