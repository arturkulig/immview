import { Dispatcher } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
import { MessageTypes } from './BaseObservable'
import { Observable } from './Observable'

export class Data<T> extends Observable<T> {
    constructor(defaultValue: T) {
        super(() => { })
        this.lastValue = defaultValue
    }

    write(nextValue: T) {
        return new Promise(resolve => {
            Data.getQueue(this).push([MessageTypes.Next, nextValue, resolve])
            Data.dispatchDigestMessages()
        })
    }
}