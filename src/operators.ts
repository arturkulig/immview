import {
    Stream,
    Subscription,
    Observer,
} from './Types'
import { diagnose } from './Diagnose'
import { DispatcherPriorities } from './DispatcherPriorities'
import { dispatch } from './DispatcherInstance'

function noop() { }

export function toPromise<T>(this: void, former$: Stream<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        let subscription: Subscription = null
        former$.subscribe({
            start: sub => {
                subscription = sub
            },
            next: v => {
                subscription.unsubscribe()
                resolve(v)
            },
            error: v => {
                subscription.unsubscribe()
                reject(v)
            },
            complete: () => {
                subscription.unsubscribe()
                reject(new Error('No value emitted, but stream has ended'))
            },
        })
    })
}

function tie<T, U>(
    this: void,
    source$: Stream<T>,
    benefactor$: Stream<U>,
    subscription: Observer<T>
) {
    let sub: Subscription = null
    source$.subscribe({
        start: _sub => {
            sub = _sub
            subscription.start(sub)
        },
        next: value => {
            if (benefactor$.closed) {
                sub.unsubscribe()
                return
            }
            subscription.next(value)
        },
        error: err => {
            if (benefactor$.closed) {
                sub.unsubscribe()
                return
            }
            subscription.error(err)
        },
        complete: () => {
            if (benefactor$.closed) {
                sub.unsubscribe()
                return
            }
            subscription.complete()
        }
    })
    return sub
}

export function map<T, U>(
    this: void, former$: Stream<T>, latter$: Stream<U>,
    transform: (value: T) => U
) {
    tie(former$, latter$, {
        start: noop,
        next: value => {
            try {
                const diagDone = (
                    diagnose.isOn &&
                    diagnose.measure(`\$> ${latter$.name}`)
                )
                const nextValue = transform(value)
                diagDone && diagDone()
                latter$.next(nextValue)
            } catch (e) {
                latter$.error(e)
            }
        },
        error: err => {
            latter$.error(err)
        },
        complete: () => {
            latter$.complete()
        }
    })
    latter$.name = `${former$.name} ➡️ ${transform.name}`
}

export function flatten<T>(this: void, former$: Stream<Stream<T>>, latter$: Stream<T>) {
    tie(former$, latter$, {
        start: noop,
        next: nextSource => {
            nextSource && nextSource.subscribe(
                nextSourceValue => {
                    latter$.next(nextSourceValue)
                },
                err => latter$.error(err)
            )
        },
        error: err => { latter$.error(err) },
        complete: () => { latter$.complete() }
    })
    latter$.name = `${former$.name} 🗜️`
}

export function scan<T, U>(
    this: void, former$: Stream<T>, latter$: Stream<U>,
    reductor: (accumulator: U, value: T, index: number) => U,
    defaultValue?: U,
) {
    let summary: U = defaultValue
    let index = 0
    tie(former$, latter$, {
        start: noop,
        next: value => {
            try {
                summary = reductor(summary, value, index++)
                latter$.next(summary)
            } catch (e) {
                latter$.error(e)
            }
        },
        error: err => { latter$.error(err) },
        complete: () => { latter$.complete() }
    })
    latter$.name = `${former$.name} ⤵️ ${reductor.name}`
}

export function filter<T>(
    this: void, former$: Stream<T>, latter$: Stream<T>,
    filter: (value: T) => boolean
) {
    tie(former$, latter$, {
        start: noop,
        next: value => {
            try {
                filter(value) && latter$.next(value)
            } catch (e) {
                latter$.error(e)
            }
        },
        error: err => { latter$.error(err) },
        complete: () => { latter$.complete() }
    })
    latter$.name = `${former$.name} 🔎 ${filter.name}`
}

export function merge<T>(this: void, sources: Stream<T>[], latter$: Stream<T>) {
    let completeSignalsAmount = 0
    const subscriber = {
        start: noop,
        next(value: T) { latter$.next(value) },
        error(error: Error) { latter$.error(error) },
        complete() {
            completeSignalsAmount++
            if (completeSignalsAmount === sources.length) {
                latter$.complete()
            }
        },
    }
    for (let source$ of sources) {
        tie(source$, latter$, subscriber)
    }
    latter$.name = `(📎 ${sources.map(o => o.name).join(',')} )`
}

export function distinct<T>(
    this: void, former$: Stream<T>, latter$: Stream<T>,
    comparator?: (prev: T, next: T) => boolean
) {
    let last
    let everPushed = false
    tie(former$, latter$, {
        start: noop,
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
    tie(former$, latter$, {
        start: noop,
        next(value) {
            history.push(value)
            if (history.length === bufferWindow) {
                latter$.next([...history])
                history = history.splice(
                    bufferStep,
                    bufferWindow - bufferStep
                )
            }
        },
        error(err) {
            latter$.error(err)
        },
        complete() {
            if (history.length > bufferWindow - bufferStep) {
                latter$.next([...history])
            }
            latter$.complete()
        }
    })
    latter$.name = `${former$.name} 💤${bufferWindow},${bufferStep}`
}

export function buffer<T>(
    this: void, former$: Stream<T>, latter$: Stream<T[]>,
    maxLastValues: number = 0
) {
    let values: T[] = []
    tie(former$, latter$, {
        start: noop,
        next(nextValue) {
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
                DispatcherPriorities.BUFFER
            )
        },
        error(err) {
            latter$.error(err)
        },
        complete() {
            if (values.length > 0) {
                latter$.next(
                    values.splice(0).reverse()
                )
            }
            latter$.complete()
        }
    })
    latter$.name = `${former$.name} 💤`
}
