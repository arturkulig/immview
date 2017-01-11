import { dispatch } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
import { Subscription } from './Subscription'
import { Observer } from './Observer'
import { CustomObserver } from './CustomObserver'

export type Subscriber<T> = (observer: Observer<T>) => void | (() => void)
export enum MessageTypes { Next, Error, Complete }
export type Transformer<T> = (current: T) => T
export type NextStep<T> = T | Transformer<T>
export type NextMessage<T> = [MessageTypes.Next, (currentState: T) => T, () => void]
export type ErrorMessage = [MessageTypes.Error, Error, () => void]
export type CompletionMessage = [MessageTypes.Complete, void, () => void]
export type Message<T> =
    NextMessage<T> |
    ErrorMessage |
    CompletionMessage
export type MessagesListEntry<T> = [BaseObservable<T>, Message<T>]
export type MessagesList = MessagesListEntry<any>[]

export interface ValueListener<T> { (nextValue: T): any }
export interface ErrorListener { (err: Error): any }
export interface CompletionListener { (): any }

const noop = () => { }

export class BaseObservable<T> implements Observer<T> {
    static awaitingMessages: MessagesList = []
    static lastObservablePriority = 0

    protected lastValue: T
    public closed = false
    public priority: number
    private cancelSubscriber: () => void
    private observers: Observer<T>[]

    constructor(subscriber?: Subscriber<T>) {
        this.observers = []
        this.priority = BaseObservable.lastObservablePriority++

        if (!subscriber) {
            this.cancelSubscriber = noop
            return
        }

        this.cancelSubscriber = (
            subscriber(new CustomObserver(
                noop,
                (nextValue: T) => {
                    this.pushMessage([MessageTypes.Next, typeof nextValue === 'function' ? nextValue : () => nextValue, noop])
                },
                (reason: Error) => {
                    this.pushMessage([MessageTypes.Error, reason, noop])
                },
                () => {
                    this.pushMessage([MessageTypes.Complete, , noop])
                }
            )) ||
            noop
        )
    }

    previous(): T {
        return this.lastValue
    }

    start() {} // intentionally noop

    next(value: NextStep<T>) {
        this.pushMessage([
            MessageTypes.Next,
            (typeof value === 'function')
                ? (value as Transformer<T>)
                : (() => value),
            noop
        ])
    }

    error(error: Error) {
        this.pushMessage([MessageTypes.Error, error, noop])
    }

    complete() {
        this.pushMessage([MessageTypes.Complete, , noop])
    }

    subscribe(observer: Observer<T>): Subscription
    subscribe(onNext?: ValueListener<T>, onError?: ErrorListener, onCompletion?: CompletionListener): Subscription
    subscribe(...args): Subscription {
        if (this.closed) {
            return new Subscription(null, () => false)
        }

        if (typeof args[0] !== 'object' || args[0] === null) {
            const [next = noop, error = noop, complete = noop] = args
            return this.subscribe({
                start: noop, next, error, complete,
            })
        }

        const observer: Observer<T> = args[0]
        this.observers.push(observer)

        const subscription = new Subscription(
            () => {
                this.observers = this.observers.filter(
                    registeredObserver => registeredObserver !== observer
                )
            },
            () => this.observers.indexOf(observer) > -1
        )

        observer.start(subscription)
        BaseObservable.dispatchDigestMessages()

        return subscription
    }

    protected pushMessage(message: Message<any>) {
        if (this.closed) return
        BaseObservable.awaitingMessages.push([this, message])
        BaseObservable.dispatchDigestMessages()
    }

    protected static dispatchDigestMessages() {
        dispatch(BaseObservable.digestAwaitingMessages, DispatcherPriorities.OBSERVABLE)
    }

    private static digestAwaitingMessages() {
        const [node, message] = BaseObservable.popMessage()
        if (!node || node.closed) {
            return
        }
        BaseObservable.digestNodeMessage(node, message)
        BaseObservable.dispatchDigestMessages()
    }

    private static popMessage(): [BaseObservable<any>, Message<any>] | [null, null] {
        if (BaseObservable.awaitingMessages.length === 0) {
            return [null, null]
        }
        for (let i = 0; i < BaseObservable.awaitingMessages.length; i++) {
            const [node = null, message] = BaseObservable.awaitingMessages[i]
            if (!node.observers.length) continue
            BaseObservable.awaitingMessages.splice(i, 1)
            return [node, message]
        }
        return [null, null]
    }

    private static digestNodeMessage(node: BaseObservable<any>, message: Message<any>) {
        const [type, , doneCallback] = message
        if (type === MessageTypes.Next) {
            const [, getValue] = (message as NextMessage<any>)
            const nextValue = getValue(node.lastValue)
            node.lastValue = nextValue
            node.observers.forEach(
                observer => observer.next(nextValue)
            )
        } else if (type === MessageTypes.Error) {
            const [, error] = (message as ErrorMessage)
            node.observers.forEach(
                observer => observer.error(error)
            )
        } else if (type === MessageTypes.Complete) {
            node.cancelSubscriber()
            node.cancelSubscriber = noop
            node.closed = true
            node.observers.splice(0).forEach(
                observer => observer.complete()
            )
        }
        dispatch(doneCallback, DispatcherPriorities.OBSERVABLE)
    }
}
