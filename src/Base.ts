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

export abstract class Base<T> implements Stream<T> {
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

    throw(err: Error): void {
        this.observers.forEach(
            observer => observer.error(err)
        )
    }

    destroy(): void {
        this.closed = true
        this.awaitingMessages.splice(0)
        this.observers.splice(0).forEach(
            observer => observer.complete()
        )
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
                __this.observers = __this.observers.filter(
                    registeredObserver => registeredObserver !== observer
                )
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
                this.throw(reason)
                break
            }
            case MessageTypes.Complete: {
                this.destroy()
                break
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
