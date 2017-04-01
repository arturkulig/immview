import { dispatch } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
import {
    Transformer,
    Stream,
    Observer,
    ValueListener,
    ErrorListener,
    CompletionListener,
    NextStep,
    Message,
    MessageTypes,
    Subscription,
} from './Types'

const noop = () => { }

export function addNodeObserver<T>(this: void, node: Stream<T>, observer: Observer<T>): Subscription {
    if (node.closed) {
        return {
            unsubscribe: noop,
            closed: false
        }
    }

    node.observers.push(observer)

    const subscription = {
        unsubscribe() {
            node.observers = node.observers.filter(
                registeredObserver => registeredObserver !== observer
            )
        },
        get closed() { return node.observers.indexOf(observer) === -1 }
    }

    observer.start(subscription)

    return subscription
}

export function normalizeToObserver<T>(args): Observer<T> {
    if (typeof args[0] !== 'object' || args[0] === null) {
        const [next = noop, error = noop, complete = noop] = args as [ValueListener<T>, ErrorListener, CompletionListener]
        return {
            start: noop, next, error, complete,
        }
    }
    return (args as [Observer<T>])[0]
}

export function flushNode<T>(this: void, node: Stream<T>, messages: Message<T>[], priority: DispatcherPriorities) {
    dispatch(
        () => {
            if (node.closed) return
            if (node.observers.length === 0) return
            if (messages.length === 0) return
            const [messageType, messageValue] = messages.shift()
            switch (messageType) {
                case MessageTypes.Next: {
                    const next = messageValue as NextStep<T>
                    node.ref(
                        (typeof next === 'function')
                            ? next(node.deref())
                            : next
                    )
                    break
                }
                case MessageTypes.Error: {
                    const reason = messageValue as Error
                    node.throw(reason)
                    break
                }
                case MessageTypes.Complete: {
                    node.destroy()
                    break
                }
            }
            flushNode(node, messages, priority)
        },
        priority
    )
}