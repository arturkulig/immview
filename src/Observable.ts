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
            return new Observable<T>(({next, error, complete}) => {
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
                complete()
            })
        }

        throw new Error('Observable.from incorrect input')
    }

    map<U>(action: (value: T) => U): Observable<U> {
        return new Observable<U>(observer => {
            const subscription = this.subscribe(
                value => {
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

    flatten<U>(this: Observable<Observable<U>>): Observable<U> {
        return new Observable<U>(observer => {
            this.subscribe(
                nextSource => {
                    nextSource && nextSource.subscribe(
                        nextSourceValue => {
                            observer.next(nextSourceValue)
                        },
                        err => observer.error(err)
                    )
                },
                observer.error,
                observer.complete
            )
        })
    }

    scan<U>(reductor: (value: T, summary: U) => U): Observable<U> {
        return new Observable<U>(observer => {
            let summary: U = null
            const subscription = this.subscribe(
                value => {
                    try {
                        summary = reductor(value, summary)
                    } catch (e) {
                        observer.error(e)
                    }
                    observer.next(summary)
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

    bufferCount(bufferSize: number, customBufferCount: number = null): Observable<T[]> {
        const bufferInterval = customBufferCount || bufferSize
        let history: T[] = []
        return new Observable<T[]>(observer => {
            const subscription = this.subscribe(
                value => {
                    history.push(value)
                    if (history.length === bufferSize) {
                        observer.next([...history])
                        history = history.splice(
                            bufferInterval,
                            bufferSize - bufferInterval
                        )
                    }
                },
                observer.error,
                () => {
                    if (history.length > bufferSize - bufferInterval) {
                        observer.next([...history])
                    }
                    observer.complete()
                }
            )
            return () => subscription.unsubscribe()
        })
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
