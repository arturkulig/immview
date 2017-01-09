import { Dispatcher } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
import { MessageTypes } from './BaseObservable'
import { Observable } from './Observable'

export type writer<T> = (currentValue: T) => T

export class Origin<T> extends Observable<T> {
    constructor(defaultValue: T) {
        super(observer => { observer.next(defaultValue) })
        this.lastValue = defaultValue
    }

    push(nextValue: T | writer<T>): Promise<void> {
        return new Promise<void>(resolve => {
            this.pushMessage([
                MessageTypes.Next,
                (typeof nextValue === 'function')
                    ? (nextValue as writer<T>)
                    : (() => (nextValue as T)),
                resolve
            ])
        })
    }
}
