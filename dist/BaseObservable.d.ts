import { BaseObservableSubscription } from './BaseObservableSubscription';
export declare type writer<T> = (currentValue: T) => T;
export declare class SubscriptionObserver<T> {
    next: (value: T | writer<T>) => void;
    error: (reason: Error) => void;
    complete: () => void;
    private _closed;
    constructor(next: (value: T | writer<T>) => void, error: (reason: Error) => void, complete: () => void, _closed: () => boolean);
    readonly closed: boolean;
}
export declare type Subscriber<T> = (observer: SubscriptionObserver<T>) => void | (() => void);
export declare enum MessageTypes {
    Next = 0,
    Error = 1,
    Complete = 2,
}
export declare type NextMessage<T> = [MessageTypes.Next, (currentState: T) => T, () => void];
export declare type ErrorMessage = [MessageTypes.Error, Error, () => void];
export declare type CompletionMessage = [MessageTypes.Complete, void, () => void];
export declare type Message<T> = NextMessage<T> | ErrorMessage | CompletionMessage;
export declare type MessagesListEntry<T> = [BaseObservable<T>, Message<T>];
export declare type MessagesList = MessagesListEntry<any>[];
export interface ValueListener<T> {
    (nextValue: T): any;
}
export interface ErrorListener {
    (err: Error): any;
}
export interface CompletionListener {
    (): any;
}
export declare class BaseObservable<T> {
    static awaitingMessages: MessagesList;
    static lastObservablePriority: number;
    protected lastValue: T;
    closed: boolean;
    priority: number;
    private cancelSubscriber;
    private nextSubscriptions;
    private errorSubscriptions;
    private completionSubscriptions;
    constructor(subscriber?: Subscriber<T>);
    last(): T;
    subscribe(onNext?: ValueListener<T>, onError?: ErrorListener, onCompletion?: CompletionListener): BaseObservableSubscription;
    cancel(): void;
    protected pushMessage(message: Message<any>): void;
    protected static dispatchDigestMessages(): void;
    private static digestAwaitingMessages();
    private static popMessage();
    private static digestNodeMessage(node, message);
}
