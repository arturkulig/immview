import {
    OpStream,
    Stream,
} from './Types'
import { BaseAtom } from './BaseAtom'
import { Observable } from './Observable'
import { DispatcherPriorities } from './DispatcherPriorities'
import { dispatch } from './DispatcherInstance'
import { diagnose } from './Diagnose'
import * as ops from './operators'

const AtomSymbol = typeof Symbol !== 'undefined' ? Symbol('AtomSymbol') : 'AtomSymbol'

export class Atom<T> extends BaseAtom<T> implements OpStream<T> {
    public static of<T>(...values: T[]): Atom<T> {
        return Atom.from<T>(values)
    }

    public static from<T>(values: Stream<T> | Iterable<T>): Atom<T> {
        if (values[AtomSymbol]) {
            const former$: Stream<T> = values[AtomSymbol]()
            const latter$ = new Atom(former$.deref())
            former$.subscribe(latter$)
            latter$.name = `${this.name} ✂📋`
            return latter$
        }

        if (values[Symbol.iterator]) {
            const iterator = (values as Iterable<T>)[Symbol.iterator]()
            let val
            for (
                let result = iterator.next();
                result.done === false;
                result = iterator.next()
            ) {
                val = result.value
            }
            const latter$ = new Atom<T>(val)
            if (values.toString()) {
                latter$.name = values.toString()
            }
            latter$.complete()
            return latter$
        }

        throw new Error('Atom.from incorrect input')
    }

    toPromise(): Promise<T> {
        return ops.toPromise(this)
    }

    map<U>(action: (value: T) => U): Atom<U> {
        const latter$ = new Atom<U>(action(this.deref()))
        ops.map(this, latter$, action)
        return latter$
    }

    flatten<U>(this: OpStream<Atom<U>>): Atom<U> {
        const latter$ = new Atom<U>(this.deref().deref())
        ops.flatten(this, latter$)
        return latter$
    }

    scan<U>(reductor: (accumulator: U, value: T, index: number) => U, defaultValue?: U): Atom<U> {
        const latter$ = new Atom<U>(defaultValue)
        ops.scan(this, latter$, reductor, defaultValue)
        return latter$
    }

    filter(filter: (value: T) => boolean): Atom<T> {
        const latter$ = new Atom<T>(this.deref())
        ops.filter(this, latter$, filter)
        return latter$
    }

    merge(...others: Stream<T>[]): Atom<T> {
        const latter$ = new Atom<T>(this.deref())
        ops.merge([this, ...others], latter$)
        return latter$
    }

    distinct(comparator?: (prev: T, next: T) => boolean): Atom<T> {
        const latter$ = new Atom<T>(this.deref())
        ops.distinct(this, latter$, comparator)
        return latter$
    }

    buffer(maxLastValues?: number): Atom<T[]> {
        const latter$ = new Atom<T[]>([this.deref()])
        ops.buffer(this, latter$, maxLastValues)
        return latter$
    }

    materialize(initialState?: T) {
        return this as Atom<T>
    }

    vaporize() {
        const latter$ = new Observable<T>()
        this.subscribe(latter$)
        return latter$
    }
}

Atom.prototype[AtomSymbol] = function () { return this }
