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
                (values[ObservableSymbol]() as Observable<T>).subscribe(observer.next, observer.error, observer.complete)
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
            const subscription = this.subscribe(
                value => {
                    if (observer.closed) {
                        return
                    }
                    try {
                        observer.next(action(value))
                    } catch (e) {
                        observer.error(e)
                    }
                },
                observer.error,
                observer.complete
            )
            return () => subscription.unsubscribe()
        })
    }

    flatMap<U>(action: (value: T) => Observable<U>): Observable<U> {
        throw new Error('not implemented')
    }

    reduce<U>(reductor: (value: T, summary: U) => U): Observable<U> {
        return new Observable<U>(observer => {
            let summary: U = null
            const subscription = this.subscribe(
                value => {
                    if (observer.closed) {
                        return
                    }

                    let newValue
                    try {
                        newValue = summary
                            ? reductor(value, summary)
                            : value
                        summary = newValue
                    } catch (e) {
                        observer.error(e)
                    }
                    observer.next(newValue)
                },
                observer.error,
                observer.complete
            )
            return () => subscription.unsubscribe()
        })
    }

    filter(filter: (value: T) => boolean): Observable<T> {
        return new Observable<T>(observer => {
            const subscription = this.subscribe(
                value => {
                    if (observer.closed) {
                        return
                    }
                    try {
                        filter(value) && observer.next(value)
                    } catch (e) {
                        observer.error(e)
                    }
                },
                observer.error,
                observer.complete
            )
            return () => subscription.unsubscribe()
        })
    }

    scan<U>(scanner: (values: T[]) => U, historyLength = 2, defaultValue = null): Observable<U> {
        throw new Error('not implemented')
    }

    buffer(maxLastMessages: number = 0): Observable<T[]> {
        let messages: T[] = []
        return new Observable<T[]>(observer => {
            const subscription = this.subscribe(
                message => {
                    messages = maxLastMessages > 0
                        ? [message, ...messages].splice(0, maxLastMessages)
                        : [message, ...messages]
                    Dispatcher
                        .push(() => {
                            if (messages.length < 1) return
                            if (observer.closed) return
                            observer.next(
                                messages
                                    .splice(0, messages.length)
                                    .reverse()
                            )
                        }, DispatcherPriorities.BUFFER)
                        .run()
                },
                observer.error,
                () => {
                    if (messages.length > 0) {
                        observer.next(
                            messages
                                .splice(0, messages.length)
                                .reverse()
                        )
                    }
                    observer.complete()
                }
            )
            return () => subscription.unsubscribe()
        })
    }
}

Observable.prototype[ObservableSymbol] = function () { return this }
