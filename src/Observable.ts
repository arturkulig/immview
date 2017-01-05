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
        return new Observable<U>(observer => {
            this.subscribe(
                value => {
                    if (observer.closed) {
                        return
                    }

                    let newValue
                    try {
                        newValue = action(value)
                    } catch (e) {
                        return observer.error(e)
                    }
                    return observer.next(newValue)
                },
                observer.error,
                observer.complete
            )
        })
    }

    flatMap<U>(action: (value: T) => Observable<U>): Observable<U> {
        throw new Error('not implemented')
    }

    reduce<U>(reductor: (value: T, summary: U) => U): Observable<U> {
        return new Observable<U>(observer => {
            let _summary : U = null
            this.subscribe(
                value => {
                    if (observer.closed) {
                        return
                    }

                    let newValue
                    try {
                        newValue = _summary
                            ? reductor(value, _summary)
                            : value
                        _summary = newValue
                    } catch (e) {
                        return observer.error(e)
                    }
                    return observer.next(newValue)
                },
                observer.error,
                observer.complete
            )
        })
    }

    filter(filter: (value: T) => boolean): Observable<T> {
        return new Observable<T>(observer => {
            this.subscribe(
                value => {
                    if (observer.closed) {
                        return
                    }

                    try {
                        if (!filter(value)) {
                            return undefined
                        }
                    } catch (e) {
                        return observer.error(e)
                    }
                    return observer.next(value)
                },
                observer.error,
                observer.complete
            )
        })
    }

    scan<U>(scanner: (values: T[]) => U, historyLength = 2, defaultValue = null): Observable<U> {
        throw new Error('not implemented')
    }

    buffer(maxLastMessages: number = 1): Observable<T> {
        throw new Error('not implemented')
    }
}

Observable.prototype[ObservableSymbol] = function () { return this }
