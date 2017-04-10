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

const dispatchObservable = job => dispatch(job, DispatcherPriorities.OBSERVABLE)

export class BaseObservable<T> extends Base<T> {
    private cancelSubscriber: () => void = noop

    constructor(subscriber?: Subscriber<T>) {
        super(dispatchObservable)

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
        if (!this.hasRef()) return NO_VALUE
        return this.deref()
    }

    destroy(): void {
        Base.prototype.destroy.call(this)
        this.cancelSubscriber()
        this.cancelSubscriber = noop
    }

    subscribe(...args): Subscription {
        const observer = normalizeToObserver(args)

        const subscription = this.addSubscription(observer)

        if (!subscription.closed) {
            observer.start(subscription)
            this.dispatch(this.flush)
        }

        return subscription
    }
}