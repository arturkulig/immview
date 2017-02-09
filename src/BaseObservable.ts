import { dispatch } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
import { diagnose } from './Diagnose'
import { Subscription } from './Subscription'
import { Observer } from './Observer'
import { SubscriptionObserver } from './SubscriptionObserver'

export type Subscriber<T> = (observer: SubscriptionObserver<T>) => void | (() => void)
export enum MessageTypes { Next, Error, Complete }
export type Transformer<T> = (current: T) => T
export type NextStep<T> = T | Transformer<T>
export type NextMessage<T> = [MessageTypes.Next, NextStep<T>, () => void]
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
export const NO_VALUE = {} as any

export class BaseObservable<T> implements Observer<T> {
    static awaitingMessages: MessagesList = []
    static lastObservablePriority = 0

    protected lastValue: T = NO_VALUE
    public closed = false
    public priority: number
    public name: string
    private cancelSubscriber: () => void
    private observers: Observer<T>[]

    constructor(subscriber?: Subscriber<T>) {
        const _this_ = this
        this.observers = []
        this.priority = BaseObservable.lastObservablePriority++

        if (subscriber && typeof subscriber.name === 'string' && subscriber.name.length > 0) {
            this.name = `${subscriber.name}\$`
        } else {
            this.name = `${this.priority}\$`
        }

        if (!subscriber) {
            this.cancelSubscriber = noop
            return
        }

        this.cancelSubscriber = (
            subscriber({
                next: (nextValue: T): void => {
                    this.pushMessage([
                        MessageTypes.Next,
                        nextValue,
                        noop
                    ])
                },
                error: (reason: Error): void => {
                    this.pushMessage([MessageTypes.Error, reason, noop])
                },
                complete: (): void => {
                    this.pushMessage([MessageTypes.Complete, , noop])
                },
                get closed(): boolean {
                    return _this_.observers.length > 0
                }
            }) ||
            noop
        )
    }

    previous(): T {
        if (this.lastValue !== NO_VALUE) {
            return this.lastValue
        }
    }

    start() {
        // observer compat
        // noop on purpose
    }

    next(nextValue: NextStep<T>) {
        this.pushMessage([
            MessageTypes.Next,
            nextValue,
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

    private static digestNodeMessage<T>(node: BaseObservable<T>, message: Message<T>) {
        const [type, , doneCallback] = message
        if (type === MessageTypes.Next) {
            const [, messageValue] = (message as NextMessage<T>)

            let nextValue
            if (typeof messageValue === 'function') {
                const getValue = messageValue as Transformer<T>
                const diagDone = (
                    diagnose.isOn &&
                    diagnose.measure(`\$> ${node.name || '[anonymous]'}.next${getValue.name ? `(${getValue.name})` : ''}`)
                )
                nextValue = getValue(node.lastValue)
                diagDone && diagDone()
            } else {
                nextValue = messageValue as T
            }

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
