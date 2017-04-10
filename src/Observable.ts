import { BaseObservable } from './BaseObservable'
import {
    NO_VALUE,
    OpStream
} from './Types'
import { DispatcherPriorities } from './DispatcherPriorities'
import { dispatch } from './DispatcherInstance'
import { diagnose } from './Diagnose'
import * as ops from './operators'

const ObservableSymbol = typeof Symbol !== 'undefined' ? Symbol('ObservableSymbol') : 'ObservableSymbol'

export {
    NO_VALUE
}
export class Observable<T> extends BaseObservable<T> implements OpStream<T> {
    public static of<T>(...values: T[]): Observable<T> {
        return Observable.from<T>(values)
    }

    public static from<T>(values: Observable<T> | Iterable<T>): Observable<T> {
        if (values[ObservableSymbol]) {
            const prevObservable = values[ObservableSymbol]() as Observable<T>
            const newObservable = new Observable<T>()
            prevObservable.subscribe(newObservable)
            newObservable.name = `${this.name} ✂📋`
            return newObservable
        }

        if (values[Symbol.iterator]) {
            const newObservable = new Observable<T>(({ next, error, complete }) => {
                const iterator = (values as Iterable<T>)[Symbol.iterator]()
                for (
                    let result = iterator.next();
                    result.done === false;
                    result = iterator.next()
                ) {
                    result.value instanceof Error
                        ? error(result.value)
                        : next(result.value)
                }
                complete()
            })
            newObservable.name = `${values.toString() || `#${newObservable.priority}`}$`
            return newObservable
        }

        throw new Error('Observable.from incorrect input')
    }

    public static fromPromise<T>(future: Promise<T>): Observable<T> {
        const newObservable = new Observable<T>(observer => {
            future
                .then(
                observer.next,
                observer.error
                )
                .then(
                observer.complete
                )
        })
        newObservable.name = 'Promise'
        return newObservable
    }

    startWith(firstValue: T) {
        const newObservable = new Observable<T>()
        newObservable.next(firstValue)
        this.subscribe(newObservable)
        newObservable.name = `${this.name} ⏹️➕⏹️⏹️⏹️…`
        return newObservable
    }

    reemit(): Observable<T> {
        console.log('Observable#reemit is deprecated! Use Atom.')
        const newObservable = new Observable<T>(observer => {
            const prev = this.previous()
            if (prev !== NO_VALUE) {
                observer.next(prev as T)
            }
            this.subscribe(observer)
        })
        newObservable.name = `${this.name} 📣`
        return newObservable
    }

    toPromise(): Promise<T> {
        return ops.toPromise(this)
    }

    map<U>(action: (value: T) => U): Observable<U> {
        const latter$ = new Observable<U>()
        ops.map(this, latter$, action)
        return latter$
    }

    flatten<U>(this: Observable<Observable<U>>): Observable<U> {
        const latter$ = new Observable<U>()
        ops.flatten(this, latter$)
        return latter$
    }

    scan<U>(reductor: (accumulator: U, value: T, index: number) => U, defaultValue?: U): Observable<U> {
        const latter$ = new Observable<U>()
        ops.scan(this, latter$, reductor, defaultValue)
        return latter$
    }

    filter(filter: (value: T) => boolean): Observable<T> {
        const latter$ = new Observable<T>()
        ops.filter(this, latter$, filter)
        return latter$
    }

    merge(...others: Observable<T>[]): Observable<T> {
        const latter$ = new Observable<T>()
        ops.merge([this as Observable<T>, ...others], latter$)
        return latter$
    }

    distinct(comparator?: (prev: T, next: T) => boolean): Observable<T> {
        const latter$ = new Observable<T>()
        ops.distinct(this, latter$, comparator)
        return latter$
    }

    bufferCount(bufferWindow: number, customBufferStep?: number): Observable<T[]> {
        const latter$ = new Observable<T[]>()
        ops.bufferCount(this, latter$, bufferWindow, customBufferStep)
        return latter$
    }

    buffer(maxLastValues?: number): Observable<T[]> {
        const latter$ = new Observable<T[]>()
        ops.buffer(this, latter$, DispatcherPriorities.OBSERVABLE_BUFFER, maxLastValues)
        return latter$
    }
}
Observable.prototype[ObservableSymbol] = function () { return this }
