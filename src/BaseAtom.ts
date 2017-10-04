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
    NoValue,
    NO_VALUE,
    NextStep,
    Message,
    MessageTypes
} from './Types'
import { Base, normalizeToObserver } from './Base'

function noop() { }

const dispatchAtom = job => dispatch(job, DispatcherPriorities.ATOM)

export class BaseAtom<T> extends Base<T> {
    constructor(initialValue: T) {
        super(dispatchAtom)
        this.ref(initialValue)
    }

    protected flush = () => {
        if (this.closed) return
        if (this.awaitingMessages.length === 0) return
        const [messageType, messageValue] = this.awaitingMessages.shift()
        this.swallow(messageType, messageValue)
        this.dispatch(this.flush)
    }

    subscribe(observer: Observer<T>): Subscription
    subscribe(
        onNext?: ValueListener<T>,
        onError?: ErrorListener,
        onCompletion?: CompletionListener
    ): Subscription
    subscribe(...args): Subscription {
        const observer = normalizeToObserver<T>(args)

        if (this.closed) {
            const subscription = {
                unsubscribe: noop,
                closed: false
            }
            observer.start(subscription)
            observer.next(this.deref())
            observer.complete()
            return subscription
        } else {
            const subscription = this.addSubscription(observer)
            observer.start(subscription)
            observer.next(this.deref())
            this.dispatch(this.flush)
            return subscription
        }
    }
}
