import { Dispatcher } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
import { ObservableSubscription } from './ObservableSubscription'

class SubscriptionObserver<T> {
    constructor(
        public next: (value: T) => void,
        public error: (reason: Error) => void,
        public complete: () => void,
        private _closed: () => boolean
    ) { }
    public get closed(): boolean {
        return this._closed()
    }
}

type AnyObservable = BaseObservable<any>
export enum MessageTypes { Next, Error, Complete }
type NextMessage<T> = [MessageTypes.Next, T, () => void]
type ErrorMessage = [MessageTypes.Error, Error, () => void]
type CompletionMessage = [MessageTypes.Complete, void, () => void]
type Message<T> =
    NextMessage<T> |
    ErrorMessage |
    CompletionMessage
type MessagesQueue<T> = Message<T>[]
type MessagesList = Map<AnyObservable, MessagesQueue<any>>

interface ValueSub<T> { (nextValue: T): any }
interface ErrorSub { (err: Error): any }
interface CompletionSub { (): any }

const noop = () => { }

export class BaseObservable<T> {
    static awaitingMessages: MessagesList = new Map()
    static lastObservablePriority = 0

    protected lastValue: T
    protected lastMessage: Message<T>
    closed = false
    priority: number
    private cancelSubscriber: () => void
    private nextSubscriptions: ValueSub<T>[]
    private errorSubscriptions: ErrorSub[]
    private completionSubscriptions: CompletionSub[]

    constructor(subscriber: (observer: SubscriptionObserver<T>) => void | (() => void)) {
        this.nextSubscriptions = []
        this.errorSubscriptions = []
        this.completionSubscriptions = []
        this.priority = BaseObservable.lastObservablePriority++

        Dispatcher.push(() => {
            this.cancelSubscriber = subscriber(new SubscriptionObserver(
                (nextValue: T) => {
                    if (this.closed) return
                    BaseObservable.getQueue(this).push([MessageTypes.Next, nextValue, noop])
                    BaseObservable.dispatchDigestMessages()
                },
                (reason: Error) => {
                    if (this.closed) return
                    BaseObservable.getQueue(this).push([MessageTypes.Error, reason, noop])
                    BaseObservable.dispatchDigestMessages()
                },
                () => {
                    if (this.closed) return
                    BaseObservable.getQueue(this).push([MessageTypes.Complete, , noop])
                    BaseObservable.dispatchDigestMessages()
                },
                () => {
                    return this.closed
                }
            )) || noop
        }).catch(
            err => console.error('BaseObservable constructor', err.stack || err.message)
            )
        Dispatcher.run()
    }

    read(): T {
        return this.lastValue
    }

    subscribe(onNext?: ValueSub<T>, onError?: ErrorSub, onCompletion?: CompletionSub): ObservableSubscription {
        if (this.closed) {
            return new ObservableSubscription(null)
        }

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

        const subscription = new ObservableSubscription(() => {
            if (onNext) { this.nextSubscriptions = this.nextSubscriptions.filter(sub => sub !== onNext) }
            if (onError) { this.errorSubscriptions = this.errorSubscriptions.filter(sub => sub !== onError) }
            if (onCompletion) { this.completionSubscriptions = this.completionSubscriptions.filter(sub => sub !== onCompletion) }
        })
        const disableSubscription = () => {
            subscription.unsubscribe()
            this.completionSubscriptions = this.completionSubscriptions.filter(
                sub => sub !== disableSubscription
            )
        }
        this.completionSubscriptions.push(disableSubscription)

        BaseObservable.dispatchDigestMessages()

        return subscription
    }

    protected static getQueue<T>(subject: BaseObservable<T>): MessagesQueue<T> {
        return BaseObservable.awaitingMessages.get(subject) || (
            BaseObservable.awaitingMessages.set(subject, []),
            BaseObservable.awaitingMessages.get(subject)
        )
    }

    protected static dispatchDigestMessages() {
        Dispatcher
            .push(BaseObservable.digestMessages, DispatcherPriorities.OBSERVABLE)
            .catch(err => {
                console.error('BaseObservable.dispatchDigestMessages', err.stack || err.message)
            })
        Dispatcher.run()
    }

    private static digestMessages() {
        const [node, queue] = BaseObservable.findOldestAwaitingNode()
        if (!node) { return }

        const message = queue.splice(0, 1)[0]
        if (queue.length === 0) {
            BaseObservable.awaitingMessages.delete(node)
        }
        node.lastMessage = message

        if (!node.closed) {
            const [type, , confirm] = message
            if (type === MessageTypes.Next) {
                const [, value] = (message as NextMessage<any>)
                node.nextSubscriptions.forEach(
                    sub => sub(value)
                )
                node.lastValue = value
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
            confirm()
        }

        BaseObservable.dispatchDigestMessages()
    }

    private static findOldestAwaitingNode<T>(): [BaseObservable<T>, MessagesQueue<T>] | [null, null] {
        if (BaseObservable.awaitingMessages.size === 0) {
            return [null, null]
        }
        const entries = BaseObservable.awaitingMessages.entries()
        let oldestNode: AnyObservable = null
        BaseObservable.awaitingMessages.forEach(
            (queue, node) => {
                if (
                    node.nextSubscriptions.length === 0 &&
                    node.errorSubscriptions.length === 0 &&
                    node.completionSubscriptions.length === 0
                ) return
                if (oldestNode === null || node.priority < oldestNode.priority) {
                    oldestNode = node
                }
            }
        )
        if (!oldestNode) {
            return [null, null]
        }
        return [oldestNode, BaseObservable.awaitingMessages.get(oldestNode)]
    }

    public static of<T>(...values: T[]): BaseObservable<T> {
        return BaseObservable.from<T>(values)
    }

    public static from<T>(values: Iterable<T>): BaseObservable<T> {
        return new BaseObservable<T>(({next, error}) => {
            const iterator = values[Symbol.iterator]()
            for (
                let result: IteratorResult<T> = iterator.next();
                result.done === false;
                result = iterator.next()
            ) {
                result.value instanceof Error
                    ? error(result.value)
                    : next(result.value)
            }
        })
    }
}
