export interface Subscription {
    closed: boolean
    unsubscribe(): void
}

export type Transformer<T> = (currentValue: T) => T

export interface Closeable {
    closed: boolean
}

export type Observer<T> =
    {
        start: (subscription: Subscription) => void
        next: (candidate: T | Transformer<T>) => void
        error: (error: Error) => void
        complete: () => void
    }

export interface ValueListener<T> { (nextValue: T): any }
export interface ErrorListener { (err: Error): any }
export interface CompletionListener { (): any }

export type SubscriptionObserver<T> =
    Observer<T> &
    Closeable

export interface Subscriber<T> {
    (observer: SubscriptionObserver<T>): void | (() => void)
}

export interface Subscribable<T> {
    observers: Observer<T>[]
    subscribe(observer: Observer<T>): Subscription
    subscribe(onNext?: ValueListener<T>, onError?: ErrorListener, onCompletion?: CompletionListener): Subscription
}

export interface ContainingReference<T> {
    deref(): T
    hasRef(): boolean
}

export type Reference<T> =
    {
        ref(reference: T): void
    } &
    ContainingReference<T>

export interface Named {
    name: string
}

export type Stream<T> =
    Observer<T> &
    Closeable &
    Subscribable<T> &
    Named &
    ContainingReference<T>

export type NO_VALUE_T = {}
export const NO_VALUE = {} as NO_VALUE_T
