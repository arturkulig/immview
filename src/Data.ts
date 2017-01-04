import { Dispatcher } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
import { MessageTypes } from './BaseObservable'
import { Observable } from './Observable'

type writer<T> = (currentValue: T) => T

export class Data<T> extends Observable<T> {
    constructor(defaultValue: T) {
        super(null)
        this.lastValue = defaultValue
    }

    write(nextValue: T | writer<T>): Promise<void> {
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
