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
    Base,
    normalizeToObserver,
} from './Base'

const noop = () => { }

const dispatchAtom = job => dispatch(job, DispatcherPriorities.ATOM)

export class BaseAtom<T> extends Base<T> {
    constructor(initialValue: T) {
        super(dispatchAtom)
        this.name = `${this.priority}\$`
        this.ref(initialValue)
    }

    subscribe(...args): Subscription {
        const observer = normalizeToObserver(args)

        const subscription = this.addSubscription(observer)

        if (!subscription.closed) {
            observer.start(subscription)
            observer.next(this.deref())
        }

        return subscription
    }
}