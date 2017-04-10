import {
    Stream,
} from './Types'
import { diagnose } from './Diagnose'
import { DispatcherPriorities } from './DispatcherPriorities'
import { dispatch } from './DispatcherInstance'
function noop() { }

export function toPromise<T>(this: void, n1: Stream<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        n1.subscribe(resolve, reject)
    })
}

export function map<T, U>(
    this: void, former$: Stream<T>, latter$: Stream<U>,
    action: (value: T) => U
) {
    former$.subscribe(
        value => {
            try {
                const diagDone = (
                    diagnose.isOn &&
                    diagnose.measure(`\$> ${latter$.name}`)
                )
                const nextValue = action(value)
                diagDone && diagDone()
                latter$.next(nextValue)
            } catch (e) {
                latter$.error(e)
            }
        },
        err => { latter$.error(err) },
        () => { latter$.complete() }
    )
    latter$.name = `${former$.name} ➡️ ${action.name}`
}

export function flatten<T>(this: void, former$: Stream<Stream<T>>, latter$: Stream<T>) {
    former$.subscribe(
        nextSource => {
            nextSource && nextSource.subscribe(
                nextSourceValue => {
                    latter$.next(nextSourceValue)
                },
                err => latter$.error(err)
            )
        },
        err => { latter$.error(err) },
        () => { latter$.complete() }
    )
    latter$.name = `${former$.name} 🗜️`
}

export function scan<T, U>(
    this: void, former$: Stream<T>, latter$: Stream<U>,
    reductor: (accumulator: U, value: T, index: number) => U,
    defaultValue?: U
) {
    let summary: U = defaultValue
    let index = 0
    former$.subscribe(
        value => {
            try {
                summary = reductor(summary, value, index++)
                latter$.next(summary)
            } catch (e) {
                latter$.error(e)
            }
        },
        err => { latter$.error(err) },
        () => { latter$.complete() }
    )
    latter$.name = `${former$.name} ⤵️ ${reductor.name}`
}

export function filter<T>(
    this: void, former$: Stream<T>, latter$: Stream<T>,
    filter: (value: T) => boolean
) {
    former$.subscribe(
        value => {
            try {
                filter(value) && latter$.next(value)
            } catch (e) {
                latter$.error(e)
            }
        },
        err => { latter$.error(err) },
        () => { latter$.complete() }
    )
    latter$.name = `${former$.name} 🔎 ${filter.name}`
}

export function merge<T>(this: void, sources: Stream<T>[], latter$: Stream<T>) {
    let completeSignalsAmount = 0
    const subscriber = {
        start() { },
        next(value: T) { latter$.next(value) },
        error(error: Error) { latter$.error(error) },
        complete() {
            completeSignalsAmount++
            if (completeSignalsAmount === sources.length) {
                latter$.complete()
            }
        },
    }
    sources.forEach(
        (other, i) => {
            other.subscribe(subscriber)
        }
    )
    latter$.name = `(📎 ${sources.map(o => o.name).join(' ')} )`
}

export function distinct<T>(
    this: void, former$: Stream<T>, latter$: Stream<T>,
    comparator?: (prev: T, next: T) => boolean
) {
    let last
    let everPushed = false
    former$.subscribe({
        start() { },
        next(value: T) {
            if (comparator) {
                if (!comparator(last, value)) return
            } else {
                if (everPushed && last === value) return
            }
            everPushed = true
            last = value
            latter$.next(value)
        },
        error(error: Error) { latter$.error(error) },
        complete() { latter$.complete() },
    })
    latter$.name = `${
        former$.name
        } 🆚 ${
        comparator
            ? (
                !!comparator.name
                    ? comparator.name
                    : '(unnamed)'
            )
            : '(reference)'
        }`
}

export function bufferCount<T>(
    this: void, former$: Stream<T>, latter$: Stream<T[]>,
    bufferWindow: number, customBufferStep?: number
) {
    const bufferStep = customBufferStep === undefined ? bufferWindow : customBufferStep
    let history: T[] = []
    former$.subscribe(
        value => {
            history.push(value)
            if (history.length === bufferWindow) {
                latter$.next([...history])
                history = history.splice(
                    bufferStep,
                    bufferWindow - bufferStep
                )
            }
        },
        err => latter$.error(err),
        () => {
            if (history.length > bufferWindow - bufferStep) {
                latter$.next([...history])
            }
            latter$.complete()
        }
    )
    latter$.name = `${former$.name} 💤${bufferWindow},${bufferStep}`
}

export function buffer<T>(
    this: void, former$: Stream<T>, latter$: Stream<T[]>,
    priority: DispatcherPriorities,
    maxLastValues: number = 0
) {
    let values: T[] = []
    former$.subscribe(
        nextValue => {
            values = maxLastValues > 0
                ? [nextValue, ...values].splice(0, maxLastValues)
                : [nextValue, ...values]
            dispatch(
                () => {
                    if (values.length === 0) return
                    latter$.next(
                        values.splice(0).reverse()
                    )
                },
                priority
            )
        },
        err => { latter$.error(err) },
        () => {
            if (values.length > 0) {
                latter$.next(
                    values.splice(0).reverse()
                )
            }
            latter$.complete()
        }
    )
    latter$.name = `${former$.name} 💤`
}
