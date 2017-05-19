import {
    OpStream
} from './Types'
import { BaseObservable } from './BaseObservable'
import { Atom } from './Atom'
import { DispatcherPriorities } from './DispatcherPriorities'
import { dispatch } from './DispatcherInstance'
import { diagnose } from './Diagnose'
import * as ops from './operators'

const ObservableSymbol = typeof Symbol !== 'undefined' ? Symbol('ObservableSymbol') : 'ObservableSymbol'

export class Observable<T> extends BaseObservable<T> implements OpStream<T> {
    static of<T>(...values: T[]): Observable<T> {
        return Observable.from<T>(values)
    }

    static from<T>(values: Observable<T> | Iterable<T>): Observable<T> {
        if (values[ObservableSymbol]) {
            const former$ = values[ObservableSymbol]() as Observable<T>
            const latter$ = new Observable<T>()
            former$.subscribe(latter$)
            latter$.name = `${this.name} ✂📋`
            return latter$
        }

        if (values[Symbol.iterator]) {
            const latter$ = new Observable<T>(({ next, error, complete }) => {
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
            if (values.toString()) {
                latter$.name = values.toString()
            }
            return latter$
        }

        throw new Error('Observable.from incorrect input')
    }

    static fromPromise<T>(future: Promise<T>): Observable<T> {
        const latter$ = new Observable<T>(observer => {
            future
                .then(
                observer.next,
                observer.error
                )
                .then(
                observer.complete
                )
        })
        latter$.name = 'Promise'
        return latter$
    }

    startWith(firstValue: T) {
        const latter$ = new Observable<T>()
        latter$.next(firstValue)
        this.subscribe(latter$)
        latter$.name = `${this.name} ⏹️➕⏹️⏹️⏹️…`
        return latter$
    }

    reemit(): Observable<T> {
        const latter$ = new Observable<T>()
        if (this.hasRef()) {
            latter$.next(this.deref())
        }
        this.subscribe(latter$)
        latter$.name = `${this.name} 📣`
        return latter$
    }

    toPromise(): Promise<T> {
        return ops.toPromise(this)
    }

    map<U>(action: (value: T) => U): Observable<U> {
        const latter$ = new Observable<U>()
        ops.map(this, latter$, action)
        return latter$
    }

    flatten<U>(this: OpStream<Observable<U>>): Observable<U> {
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
        ops.buffer(this, latter$, maxLastValues)
        return latter$
    }

    materialize(initialState: T) {
        const latter$ = new Atom(initialState)
        this.subscribe(latter$)
        latter$.name = `${this.name} ⚛️`
        return latter$
    }

    vaporize() {
        return this as Observable<T>
    }
}

Observable.prototype[ObservableSymbol] = function () { return this }
