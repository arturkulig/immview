import { Subscription } from './Subscription'
export type transducer<T> = (currentValue: T) => T
export interface Observer<T> {
    start: (subscription: Subscription) => void
    next: (candidate: T | transducer<T>) => void
    error: (error: Error) => void
    complete: () => void
}