import { Atom } from './Atom'
import { Observable } from './Observable'

export interface Subscription {
    closed: boolean
    unsubscribe(): void
}

export type Transformer<T> = (currentValue: T) => T

export type NextStep<T> = T | Transformer<T>

export interface Closeable {
    closed: boolean
}

export type Observer<T> =
    {
        start: (subscription: Subscription) => void
        next: (candidate: T) => void
        error: (error: Error) => void
        complete: () => void
    }

export type StreamObserver<T> =
    {
        start: (subscription: Subscription) => void
        next: (candidate: NextStep<T>) => void
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

export interface Receiver<T> {
    ref(reference: T): void
    deref(): T
    hasRef(): boolean
}

export interface Named {
    name: string
}

export type Stream<T> =
    StreamObserver<T> &
    Closeable &
    Subscribable<T> &
    Named &
    Receiver<T> &
    AsyncIterable<T> &
    PromiseLike<T>

export type OpStream<T> =
    Stream<T> &
    {
        toPromise(): Promise<T>
        map<U>(action: (value: T) => U): OpStream<U>
        flatten<U>(this: OpStream<OpStream<U>>): OpStream<U>
        scan<U>(reductor: (accumulator: U, value: T, index: number) => U, defaultValue?: U): OpStream<U>
        filter(filter: (value: T) => boolean): OpStream<T>
        merge(...others: OpStream<T>[]): OpStream<T>
        distinct(comparator?: (prev: T, next: T) => boolean): OpStream<T>
        buffer(maxLastValues: number): OpStream<T[]>
        materialize(initialState: T): Atom<T>
        vaporize(): Observable<T>
    }

export type NO_VALUE_T = {}
export const NO_VALUE = {} as NO_VALUE_T
export type Message<T> = [MessageTypes, NextStep<T> | Error | void]
export enum MessageTypes { Next, Error, Complete }
