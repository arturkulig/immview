import { Dispatcher } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
import { ObservableSubscription } from './ObservableSubscription'

interface Observer<T> {
    next(value: T): void
    error(reason: Error): void
    complete(): void
}
type AnyObservable = BaseObservable<any>
enum MessageTypes { Next, Error, Complete }
type Message<T> =
    [MessageTypes.Next, T] |
    [MessageTypes.Error, Error] |
    [MessageTypes.Complete]
type MessagesQueue<T> = Message<T>[]
type MessagesList = Map<AnyObservable, MessagesQueue<any>>

interface ValueSub<T> { (nextValue: T): any }
interface ErrorSub { (err: Error): any }
interface CompletionSub { (): any }

export class BaseObservable<T> {
    static awaitingMessages: MessagesList = new Map()
    static lastObservablePriority = 0

    private lastValue: T
    private lastMessage: Message<T>
    closed = false
    priority: number
    private stopController: () => void
    private valueSubscriptions: ValueSub<T>[]
    private errorSubscriptions: ErrorSub[]
    private completionSubscriptions: CompletionSub[]

    constructor(controller: (observer: Observer<T>) => () => void) {
        this.valueSubscriptions = []
        this.errorSubscriptions = []
        this.completionSubscriptions = []
        this.priority = BaseObservable.lastObservablePriority++

        this.stopController = controller({
            next: (nextValue: T) => {
                if (this.closed) return
                this.getQueue().push([MessageTypes.Next, nextValue])
                BaseObservable.dispatchDigestMessages()
            },
            error: (reason: Error) => {
                if (this.closed) return
                this.getQueue().push([MessageTypes.Error, reason])
                BaseObservable.dispatchDigestMessages()
            },
            complete: () => {
                if (this.closed) return
                this.getQueue().push([MessageTypes.Complete])
                BaseObservable.dispatchDigestMessages()
            }
        })
    }

    read(): T {
        return this.lastValue
    }

    subscribe(onValue?: ValueSub<T>, onError?: ErrorSub, onCompletion?: CompletionSub): ObservableSubscription {
        if (this.closed) {
            return new ObservableSubscription(null)
        }

        const subscription = new ObservableSubscription(() => {
            if (onValue) { this.valueSubscriptions = this.valueSubscriptions.filter(sub => sub !== onValue) }
            if (onError) { this.errorSubscriptions = this.errorSubscriptions.filter(sub => sub !== onError) }
            if (onCompletion) { this.completionSubscriptions = this.completionSubscriptions.filter(sub => sub !== onCompletion) }
        })

        if (onValue) {
            this.valueSubscriptions.push(onValue)
            if (this.lastValue !== undefined) onValue(this.lastValue)
        }
        if (onError) {
            this.errorSubscriptions.push(onError)
            if (this.lastMessage && this.lastMessage[0] === MessageTypes.Error) onError((this.lastMessage[1] as Error))
        }
        if (onCompletion) {
            this.completionSubscriptions.push(onCompletion)
        }

        const disableSubscription = () => {
            subscription.unsubscribe()
            this.completionSubscriptions = this.completionSubscriptions.filter(
                sub => sub !== disableSubscription
            )
        }
        this.completionSubscriptions.push(disableSubscription)

        return subscription
    }

    private getQueue(): MessagesQueue<T> {
        return BaseObservable.awaitingMessages.get(this) || (
            BaseObservable.awaitingMessages.set(this, []),
            BaseObservable.awaitingMessages.get(this)
        )
    }

    private static dispatchDigestMessages() {
        Dispatcher.push(BaseObservable.digestMessages, DispatcherPriorities.OBSERVABLE)
        Dispatcher.run()
    }

    private static digestMessages() {
        const [node, queue] = BaseObservable.findOldestAwaitingNode()
        if (!node) {
            return
        }
        const message = queue.splice(0, 1)[0]
        if (queue.length === 0) {
            BaseObservable.awaitingMessages.delete(node)
        }
        node.lastMessage = message

        const [type] = message
        if (type === MessageTypes.Next) {
            node.valueSubscriptions.forEach(
                sub => sub(message[1])
            )
            node.lastValue = message[1]
        } else if (type === MessageTypes.Error) {
            node.errorSubscriptions.forEach(
                sub => sub((message[1] as Error))
            )
        } else if (type === MessageTypes.Complete) {
            node.completionSubscriptions.forEach(
                sub => sub()
            )
            node.closed = true
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
}
