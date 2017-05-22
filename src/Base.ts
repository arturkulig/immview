import { diagnose } from './Diagnose'
import {
    Stream,
    Observer,
    ValueListener,
    ErrorListener,
    CompletionListener,
    Subscription,
    NO_VALUE_T,
    NO_VALUE,
    NextStep,
    Message,
    MessageTypes,
} from './Types'

function fillAsyncIterSymbol() {
    (Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol('Symbol.asyncIterator')
}
fillAsyncIterSymbol()

export abstract class Base<T> implements Stream<T>, AsyncIterable<T> {
    protected awaitingMessages: Message<T>[]
    private lastValue: T

    closed: boolean
    name: string
    observers: Observer<T>[]

    constructor(protected dispatch: (job: Function) => void) {
        this.closed = false
        this.name = `${ID()}\$`
        this.observers = []
        this.lastValue = null
        this.awaitingMessages = []
    }

    // reference interface

    ref(value: T) {
        this.lastValue = value
        this.hasRef = () => true
        this.observers.forEach(
            observer => observer.next(value)
        )
    }

    deref(): T {
        return this.lastValue
    }

    hasRef() {
        return false
    }

    // observer interface

    start(subscription: Subscription) {
        // observer compat
        // noop on purpose
    }

    next(nextValue: NextStep<T>) {
        this.awaitingMessages.push([
            MessageTypes.Next,
            nextValue,
        ])
        this.dispatch(this.flush)
    }

    error(reason: Error) {
        this.awaitingMessages.push([
            MessageTypes.Error,
            reason,
        ])
        this.dispatch(this.flush)
    }

    complete() {
        this.awaitingMessages.push([
            MessageTypes.Complete,
            undefined,
        ])
        this.dispatch(this.flush)
    }

    // subscribable interface

    abstract subscribe(observer: Observer<T>): Subscription
    abstract subscribe(onNext?: ValueListener<T>, onError?: ErrorListener, onCompletion?: CompletionListener): Subscription
    abstract subscribe(...args): Subscription

    protected addSubscription(observer: Observer<T>) {
        if (this.closed) {
            return {
                unsubscribe: noop,
                closed: false
            }
        }

        this.observers.push(observer)

        const __this = this
        return {
            unsubscribe() {
                let pos
                if ((pos = __this.observers.indexOf(observer)) < 0) return
                __this.observers.splice(pos, 1)
            },
            get closed() { return __this.observers.indexOf(observer) === -1 }
        }
    }

    protected abstract flush: () => void

    protected swallow(messageType: MessageTypes, messageValue: NextStep<T> | Error | void) {
        switch (messageType) {
            case MessageTypes.Next: {
                const next = messageValue as NextStep<T>
                if (typeof next === 'function') {
                    const endMeasurement = diagnose.isOn && diagnose.measure(`${this.name} next(${next.name || ''})`)
                    const nextVal = next(this.deref())
                    if (endMeasurement) endMeasurement()
                    this.ref(nextVal)
                } else {
                    this.ref(next)
                }

                break
            }
            case MessageTypes.Error: {
                const reason = messageValue as Error
                this.observers.forEach(
                    observer => observer.error(reason)
                )
                break
            }
            case MessageTypes.Complete: {
                this.closed = true
                this.awaitingMessages.splice(0)
                this.observers.splice(0).forEach(
                    observer => observer.complete()
                )
                break
            }
        }
    }


    [Symbol.asyncIterator](): AsyncIterator<T> {
        const consumers: Array<(v: IteratorResult<T>) => void> = []
        const products: IteratorResult<T>[] = []
        const sub = this.subscribe({
            next: value => {
                products.push({ done: false, value })
                while (products.length && consumers.length) {
                    consumers.shift()(products.shift())
                }
            },
            complete: () => {
                products.push({ done: true, value: this.lastValue })
                while (products.length && consumers.length) {
                    consumers.shift()(products.shift())
                }
            }
        })
        return {
            next: () => {
                const passer = new Promise<IteratorResult<T>>(resolve => { consumers.push(resolve) })
                while (products.length && consumers.length) {
                    consumers.shift()(products.shift())
                }
                return passer
            },
            throw: (e?: any) => {
                sub.unsubscribe()
                this.error(e)
                this.complete()
                return Promise.resolve({ done: true, value: this.lastValue })
            },
            return: () => {
                sub.unsubscribe()
                this.complete()
                return Promise.resolve({ done: true, value: this.lastValue })
            }
        }
    }
}

export function normalizeToObserver<T>(args): Observer<T> {
    if (typeof args[0] !== 'object' || args[0] === null) {
        const [next, error, complete] = args as [ValueListener<T>, ErrorListener, CompletionListener]
        return {
            start: noop,
            next: next || noop,
            error: error || noop,
            complete: complete || noop,
        }
    }
    const observer = (args as [Observer<T>])[0]
    observer.start = observer.start || noop
    observer.next = observer.next || noop
    observer.error = observer.error || noop
    observer.complete = observer.complete || noop
    return observer
}

let lastID = 0

function ID(): number {
    return ++lastID
}

function noop() { }
