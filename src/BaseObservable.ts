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
} from './Observer'

type NextStep<T> = T | Transformer<T>
type Message<T> = [MessageTypes, NextStep<T> | Error | void]
enum MessageTypes { Next, Error, Complete }

const noop = () => { }

const { OBSERVABLE } = DispatcherPriorities

export class BaseObservable<T> implements Stream<T> {
    static lastObservablePriority = 0

    private awaitingMessages: Message<T>[] = []
    private lastValue: T | NO_VALUE_T = NO_VALUE
    private cancelSubscriber: () => void = noop

    closed = false
    priority: number = BaseObservable.lastObservablePriority++
    name: string = null
    observers: Observer<T>[] = []

    constructor(subscriber?: Subscriber<T>) {
        if (subscriber && typeof subscriber.name === 'string' && subscriber.name.length > 0) {
            this.name = `${subscriber.name}\$`
        } else {
            this.name = `${this.priority}\$`
        }

        if (subscriber) {
            const node = this
            this.cancelSubscriber = (
                subscriber({
                    start: this.start.bind(this),
                    next: this.next.bind(this),
                    error: this.error.bind(this),
                    complete: this.complete.bind(this),
                    get closed(): boolean {
                        return node.observers.length > 0
                    }
                }) ||
                noop
            )
        }
    }

    previous(): T | NO_VALUE_T {
        return this.lastValue
    }

    // reference interface

    private ref(value: T) {
        this.lastValue = value
        this.observers.forEach(
            observer => observer.next(value)
        )
    }

    deref(): T {
        if (this.lastValue === NO_VALUE) return
        return (this.lastValue as T)
    }

    hasRef() {
        return this.lastValue !== NO_VALUE
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
        this.cancelSubscriber()
        this.cancelSubscriber = noop
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
        if (this.closed) {
            return {
                unsubscribe: noop,
                closed: false
            }
        }

        if (typeof args[0] !== 'object' || args[0] === null) {
            const [next = noop, error = noop, complete = noop] = args
            return this.subscribe({
                start: noop, next, error, complete,
            })
        }

        const observer: Observer<T> = args[0]
        this.observers.push(observer)

        const node = this
        const subscription = {
            unsubscribe() {
                node.observers = node.observers.filter(
                    registeredObserver => registeredObserver !== observer
                )
            },
            get closed() { return node.observers.indexOf(observer) === -1 }
        }

        observer.start(subscription)
        this.flushNode()

        return subscription
    }

    flushNode() {
        dispatch(
            () => {
                if (this.closed) return
                if (this.observers.length === 0) return
                if (this.awaitingMessages.length === 0) return
                const [messageType, messageValue] = this.awaitingMessages.shift()
                switch (messageType) {
                    case MessageTypes.Next: {
                        const next = messageValue as NextStep<T>
                        this.ref(
                            (typeof next === 'function')
                                ? next(this.deref())
                                : next
                        )
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
                this.flushNode()
            },
            OBSERVABLE
        )
    }
}
