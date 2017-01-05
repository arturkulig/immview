import { BaseObservable } from './BaseObservable'
import { DispatcherPriorities } from './DispatcherPriorities'
import { Dispatcher } from './DispatcherInstance'

const ObservableSymbol = typeof Symbol !== 'undefined' ? Symbol('ObservableSymbol') : 'ObservableSymbol'

export class Observable<T> extends BaseObservable<T> {
    public static of<T>(...values: T[]): Observable<T> {
        return Observable.from<T>(values)
    }

    public static from<T>(values: Observable<T> | Iterable<T>): Observable<T> {
        if (values[ObservableSymbol]) {
            return new Observable<T>(observer => {
                const sub = (values[ObservableSymbol]() as Observable<T>).subscribe(observer.next, observer.error, observer.complete)
            })
        }

        if (values[Symbol.iterator]) {
            return new Observable<T>(({next, error}) => {
                const iterator = values[Symbol.iterator]()
                for (
                    let result: IteratorResult<T> = iterator.next();
                    result.done === false;
                    result = iterator.next()
                ) {
                    result.value instanceof Error
                        ? error(result.value)
                        : next(result.value)
                }
            })
        }

        throw new Error('Observable.from incorrect input')
    }

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

    buffer(maxLastMessages: number = 1): Observable<T> {
        throw new Error('not implemented')
    }
}

Observable.prototype[ObservableSymbol] = function () { return this }
