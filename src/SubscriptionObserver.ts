export type transducer<T> = (currentValue: T) => T
export interface SubscriptionObserver<T> {
    start: () => void
    next: (candidate: T | transducer<T>) => void
    error: (error: Error) => void
    complete: () => void
    closed: boolean
}
