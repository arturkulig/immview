import { dispatch } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
import { BaseObservableSubscription } from './BaseObservableSubscription'

type writer<T> = (currentValue: T) => T
class SubscriptionObserver<T> {
    constructor(
        public next: (value: T | writer<T>) => void,
        public error: (reason: Error) => void,
        public complete: () => void,
        private _closed: () => boolean
    ) { }
    public get closed(): boolean {
        return this._closed()
    }
}
type Subscriber<T> = (observer: SubscriptionObserver<T>) => void | (() => void)

export enum MessageTypes { Next, Error, Complete }
type NextMessage<T> = [MessageTypes.Next, (currentState: T) => T, () => void]
type ErrorMessage = [MessageTypes.Error, Error, () => void]
type CompletionMessage = [MessageTypes.Complete, void, () => void]
type Message<T> =
    NextMessage<T> |
    ErrorMessage |
    CompletionMessage
type MessagesListEntry<T> = [BaseObservable<T>, Message<T>]
type MessagesList = MessagesListEntry<any>[]

interface ValueListener<T> { (nextValue: T): any }
interface ErrorListener { (err: Error): any }
interface CompletionListener { (): any }

const noop = () => { }

export class BaseObservable<T> {
    static awaitingMessages: MessagesList = []
    static lastObservablePriority = 0

    protected lastValue: T
    protected lastMessage: Message<T>
    public closed = false
    public priority: number
    private cancelSubscriber: () => void
    private nextSubscriptions: ValueListener<T>[]
    private errorSubscriptions: ErrorListener[]
    private completionSubscriptions: CompletionListener[]

    constructor(subscriber?: Subscriber<T>) {
        this.nextSubscriptions = []
        this.errorSubscriptions = []
        this.completionSubscriptions = []
        this.priority = BaseObservable.lastObservablePriority++

        this.cancelSubscriber = (
            subscriber &&
            subscriber(new SubscriptionObserver(
                (nextValue: T) => {
                    if (this.closed) return
                    this.pushMessage([MessageTypes.Next, typeof nextValue === 'function' ? nextValue : () => nextValue, noop])
                },
                (reason: Error) => {
                    if (this.closed) return
                    this.pushMessage([MessageTypes.Error, reason, noop])
                },
                () => {
                    if (this.closed) return
                    this.pushMessage([MessageTypes.Complete, , noop])
                },
                () => {
                    return this.closed
                }
            ))
        ) || noop
    }

    last(): T {
        if (this.lastValue) return this.lastValue
        if (this.nextSubscriptions.length > 0) return this.lastValue
        const messages = BaseObservable.awaitingMessages.filter(
            ([node, message]) => node === this
        )
        if (messages.length === 0) return
        const marginEntry = messages[0] as MessagesListEntry<T>
        const marginMessage = marginEntry[1] as NextMessage<T>
        if (marginMessage[0] === MessageTypes.Next) {
            BaseObservable.awaitingMessages = BaseObservable.awaitingMessages.filter(
                (entry) => entry !== marginEntry
            )
            return (this.lastValue = (marginMessage[1](this.lastValue) as T))
        }
    }

    subscribe(onNext?: ValueListener<T>, onError?: ErrorListener, onCompletion?: CompletionListener): BaseObservableSubscription {
        if (this.closed) {
            return new BaseObservableSubscription(null)
        }

        const disableSubscription = () => {
            subscription.unsubscribe()
            this.completionSubscriptions = this.completionSubscriptions.filter(
                sub => sub !== disableSubscription
            )
        }
        this.completionSubscriptions.push(disableSubscription)

        if (onNext) {
            this.nextSubscriptions.push(onNext)
            if (this.lastValue !== undefined) onNext(this.lastValue)
        }
        if (onError) {
            this.errorSubscriptions.push(onError)
            if (this.lastMessage && this.lastMessage[0] === MessageTypes.Error) onError((this.lastMessage[1] as Error))
        }
        if (onCompletion) {
            this.completionSubscriptions.push(onCompletion)
        }

        const subscription = new BaseObservableSubscription(() => {
            if (onNext) { this.nextSubscriptions = this.nextSubscriptions.filter(sub => sub !== onNext) }
            if (onError) { this.errorSubscriptions = this.errorSubscriptions.filter(sub => sub !== onError) }
            if (onCompletion) { this.completionSubscriptions = this.completionSubscriptions.filter(sub => sub !== onCompletion) }
        })

        BaseObservable.dispatchDigestMessages()

        return subscription
    }

    protected pushMessage(message: Message<any>) {
        BaseObservable.awaitingMessages.push([this, message])
        BaseObservable.dispatchDigestMessages()
    }

    protected static dispatchDigestMessages() {
        dispatch(BaseObservable.digestAwaitingMessages, DispatcherPriorities.OBSERVABLE)
    }

    private static digestAwaitingMessages() {
        const [node, message] = BaseObservable.popMessage()
        if (!node) {
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
            if (message[0] === MessageTypes.Next && !node.nextSubscriptions.length) continue
            if (message[0] === MessageTypes.Error && !node.errorSubscriptions.length) continue
            if (message[0] === MessageTypes.Complete && !node.completionSubscriptions.length) continue
            BaseObservable.awaitingMessages.splice(i, 1)
            return [node, message]
        }
        return [null, null]
    }

    private static digestNodeMessage(node: BaseObservable<any>, message: Message<any>) {
        if (!node.closed) {
            node.lastMessage = message
            const [type, , doneCallback] = message
            if (type === MessageTypes.Next) {
                const [, getValue] = (message as NextMessage<any>)
                const nextValue = getValue(node.lastValue)
                node.lastValue = nextValue
                node.nextSubscriptions.forEach(
                    sub => sub(nextValue)
                )
            } else if (type === MessageTypes.Error) {
                const [, error] = (message as ErrorMessage)
                node.errorSubscriptions.forEach(
                    sub => sub(error)
                )
            } else if (type === MessageTypes.Complete) {
                node.cancelSubscriber()
                node.cancelSubscriber = noop
                node.closed = true
                node.completionSubscriptions.forEach(
                    sub => sub()
                )
            }
            doneCallback()
        }
    }
}
