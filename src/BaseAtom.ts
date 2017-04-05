import { dispatch } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
import { diagnose } from './Diagnose'
import {
    Stream,
    Observer,
    SubscriptionObserver,
    ValueListener,
    ErrorListener,
    CompletionListener,
    Subscribable,
    Transformer,
    Subscriber,
    Subscription,
    NO_VALUE_T,
    NO_VALUE,
    NextStep,
    Message,
    MessageTypes,
} from './Types'
import {
    addNodeObserver,
    normalizeToObserver,
    flushNode,
    ID,
} from './BaseUtils'

const noop = () => { }

const { ATOM } = DispatcherPriorities

export class BaseAtom<T> implements Stream<T> {
    private awaitingMessages: Message<T>[] = []
    private lastValue: T

    closed = false
    priority: number = ID()
    name: string = null
    observers: Observer<T>[] = []

    constructor(initialValue: T) {
        this.name = `${this.priority}\$`
        this.lastValue = initialValue
    }

    // reference interface

    ref(value: T) {
        this.lastValue = value
        this.observers.forEach(
            observer => observer.next(value)
        )
    }

    deref(): T {
        return this.lastValue
    }

    hasRef() {
        return true
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

    start() {
        // observer compat
        // noop on purpose
    }

    next(nextValue: NextStep<T>) {
        this.awaitingMessages.push([
            MessageTypes.Next,
            nextValue,
        ])
        this.flushNode()
    }

    error(reason: Error) {
        this.awaitingMessages.push([
            MessageTypes.Error,
            reason,
        ])
        this.flushNode()
    }

    complete() {
        this.awaitingMessages.push([
            MessageTypes.Complete,
            undefined,
        ])
        this.flushNode()
    }

    // subscribable interface

    subscribe(...args): Subscription {
        const observer = normalizeToObserver(args)
        const subscription = addNodeObserver(this, observer)
        observer.start(subscription)
        observer.next(this.deref())
        this.flushNode()
        return subscription
    }

    private flushNode() {
        flushNode(this, this.awaitingMessages, ATOM)
    }
}