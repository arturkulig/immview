import { Subscription } from './Subscription';
import { Observer } from './Observer';
export declare type Subscriber<T> = (observer: Observer<T>) => void | (() => void);
export declare enum MessageTypes {
    Next = 0,
    Error = 1,
    Complete = 2,
}
export declare type Transformer<T> = (current: T) => T;
export declare type NextStep<T> = T | Transformer<T>;
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
    private observers;
    constructor(subscriber?: Subscriber<T>);
    previous(): T;
    next(value: NextStep<T>): Promise<void>;
    error(error: Error): Promise<void>;
    complete(): Promise<void>;
    subscribe(observer: Observer<T>): Subscription;
    subscribe(onNext?: ValueListener<T>, onError?: ErrorListener, onCompletion?: CompletionListener): Subscription;
    protected pushMessage(message: Message<any>): void;
    protected static dispatchDigestMessages(): void;
    private static digestAwaitingMessages();
    private static popMessage();
    private static digestNodeMessage(node, message);
}
