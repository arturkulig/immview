import { Subscription } from './Subscription'

export type Transformer<T> = (currentValue: T) => T

export interface Observer<T> {
    start: (subscription: Subscription) => void
    next: (candidate: T | Transformer<T>) => void
    error: (error: Error) => void
    complete: () => void
}

export interface ValueListener<T> { (nextValue: T): any }
export interface ErrorListener { (err: Error): any }
export interface CompletionListener { (): any }

export interface SubscriptionObserver<T> {
    start: () => void
    next: (candidate: T | Transformer<T>) => void
    error: (error: Error) => void
    complete: () => void
    closed: boolean
}

export interface Subscriber<T> {
    (observer: SubscriptionObserver<T>): void | (() => void)
}

export interface Subscribable<T> {
    subscribe(observer: Observer<T>): Subscription
    subscribe(onNext?: ValueListener<T>, onError?: ErrorListener, onCompletion?: CompletionListener): Subscription
}

export interface Reference<T> {
    deref(): T
}

export type Reactive<T> =
    Observer<T> &
    Subscribable<T> &
    Reference<T>
