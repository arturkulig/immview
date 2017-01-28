import { BaseObservable } from './BaseObservable'
import { DispatcherPriorities } from './DispatcherPriorities'
import { dispatch } from './DispatcherInstance'
import { diagnose } from './Diagnose'

const ObservableSymbol = typeof Symbol !== 'undefined' ? Symbol('ObservableSymbol') : 'ObservableSymbol'

export class Observable<T> extends BaseObservable<T> {
    public static of<T>(...values: T[]): Observable<T> {
        return Observable.from<T>(values)
    }

    public static from<T>(values: Observable<T> | Iterable<T>): Observable<T> {
        if (values[ObservableSymbol]) {
            const prevObservable = values[ObservableSymbol]() as Observable<T>
            const newObservable = new Observable<T>(observer => {
                prevObservable.subscribe(observer.next, observer.error, observer.complete)
            })
            const newObservableName = `${this.name}>$`
            newObservable.name = newObservableName
            return newObservable
        }

        if (values[Symbol.iterator]) {
            const newObservable = new Observable<T>(({next, error, complete}) => {
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
            const newObservableName = `${values[Symbol.toStringTag] || values.toString() || `#${newObservable.priority}`}$`
            newObservable.name = newObservableName
            return newObservable
        }

        throw new Error('Observable.from incorrect input')
    }

    map<U>(action: (value: T) => U): Observable<U> {
        const newObservable = new Observable<U>(observer => {
            const subscription = this.subscribe(
                value => {
                    try {
                        const diagDone = diagnose.isOn && diagnose.measure(`\$> ${newObservableName}`)
                        const nextValue = action(value)
                        diagDone && diagDone()
                        observer.next(nextValue)
                    } catch (e) {
                        observer.error(e)
                    }
                },
                observer.error,
                observer.complete
            )
            return () => subscription.unsubscribe()
        })
        const newObservableName = `${this.name} |> ${action.name || `#${newObservable.priority}`}`
        newObservable.name = newObservableName
        return newObservable
    }

    flatten<U>(this: Observable<Observable<U>>): Observable<U> {
        const newObservableName = `${this.name} |> $$>$`
        const newObservable = new Observable<U>(observer => {
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
        newObservable.name = newObservableName
        return newObservable
    }

    scan<U>(reductor: (accumulator: U, value: T, index: number) => U): Observable<U> {
        const newObservable = new Observable<U>(observer => {
            let summary: U
            let index = 0
            const subscription = this.subscribe(
                value => {
                    try {
                        summary = reductor(summary, value, index++)
                        observer.next(summary)
                    } catch (e) {
                        observer.error(e)
                    }
                },
                observer.error,
                observer.complete
            )
            return () => subscription.unsubscribe()
        })
        const newObservableName = `${this.name} += ${reductor || `#${newObservable.priority}`}`
        newObservable.name = newObservableName
        return newObservable
    }

    filter(filter: (value: T) => boolean): Observable<T> {
        const newObservable = new Observable<T>(observer => {
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
        const newObservableName = `${this.name} ? ${filter.name || `#${newObservable.priority}`}`
        newObservable.name = newObservableName
        return newObservable
    }

    merge(...others: Observable<T>[]): Observable<T> {
        let completeSignalsAmount = 0
        const newObservable = new Observable<T>()
        const subscriber = {
            start() { },
            next(value: T) { newObservable.next(value) },
            error(error: Error) { newObservable.error(error) },
            complete() {
                completeSignalsAmount++
                if (completeSignalsAmount === others.length + 1) {
                    newObservable.complete()
                }
            },
        }
        this.subscribe(subscriber)
        others.forEach(
            other => other.subscribe(subscriber)
        )
        newObservable.name = `( ${[this, ...others].map(o => o.name).join(' + ')} )`
        return newObservable
    }

    bufferCount(bufferWindow: number, customBufferStep?: number): Observable<T[]> {
        const bufferStep = customBufferStep === undefined ? bufferWindow : customBufferStep
        let history: T[] = []
        const newObservable = new Observable<T[]>(observer => {
            const subscription = this.subscribe(
                value => {
                    history.push(value)
                    if (history.length === bufferWindow) {
                        observer.next([...history])
                        history = history.splice(
                            bufferStep,
                            bufferWindow - bufferStep
                        )
                    }
                },
                observer.error,
                () => {
                    if (history.length > bufferWindow - bufferStep) {
                        observer.next([...history])
                    }
                    observer.complete()
                }
            )
            return () => subscription.unsubscribe()
        })
        newObservable.name = `${this.name} >|>${bufferWindow},${bufferStep}`
        return newObservable
    }

    buffer(maxLastValues: number = 0): Observable<T[]> {
        let values: T[] = []
        const newObservable = new Observable<T[]>(observer => {
            const subscription = this.subscribe(
                nextValue => {
                    values = maxLastValues > 0
                        ? [nextValue, ...values].splice(0, maxLastValues)
                        : [nextValue, ...values]
                    dispatch(
                        () => {
                            if (values.length === 0) return
                            observer.next(
                                values.splice(0).reverse()
                            )
                        },
                        DispatcherPriorities.BUFFER
                    )
                },
                observer.error,
                () => {
                    if (values.length > 0) {
                        observer.next(
                            values.splice(0).reverse()
                        )
                    }
                    observer.complete()
                }
            )
            return () => subscription.unsubscribe()
        })
        newObservable.name = `${this.name} >|>`
        return newObservable
    }
}
Observable.prototype[ObservableSymbol] = function () { return this }
