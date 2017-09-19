import { dispatch } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
import { diagnose } from './Diagnose'
import {
  Subscriber,
  Subscription,
  Observer,
  ValueListener,
  ErrorListener,
  CompletionListener,
  NoValue,
  NO_VALUE
} from './Types'
import { Base, normalizeToObserver } from './Base'

const noop = () => {}

const dispatchObservable = job => dispatch(job, DispatcherPriorities.OBSERVABLE)

export class BaseObservable<T> extends Base<T> {
  private cancelSubscriber: () => void = noop

  constructor(subscriber?: Subscriber<T>) {
    super(dispatchObservable)

    if (
      subscriber &&
      typeof subscriber.name === 'string' &&
      subscriber.name.length > 0
    ) {
      this.name = `${subscriber.name}\$`
    }

    if (subscriber) {
      const node = this
      this.cancelSubscriber =
        subscriber({
          start: node.start.bind(node),
          next: node.next.bind(node),
          error: node.error.bind(node),
          complete: node.complete.bind(node),
          get closed(): boolean {
            return node.observers.length > 0
          }
        }) || noop
    }
  }

  previous(): T | NoValue {
    console.log(
      'Observable#previous is deprecated! Use Observable#hasRef and Observable#deref.'
    )
    if (!this.hasRef()) return NO_VALUE
    return this.deref()
  }

  complete(): void {
    this.cancelSubscriber()
    this.cancelSubscriber = noop
    Base.prototype.complete.call(this)
  }

  protected flush = () => {
    if (this.closed) return
    if (this.awaitingMessages.length === 0) return
    if (this.observers.length === 0) return
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
    const observer = normalizeToObserver(args)

    const subscription = this.addSubscription(observer)

    if (!subscription.closed) {
      observer.start(subscription)
      this.dispatch(this.flush)
    }

    return subscription
  }
}
