import { ValueListener } from './BaseObservable'
import { Subscription } from './Subscription'
import { Observable } from './Observable'
import { Observer } from './Observer'
import { dispatch } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'

export class Property<T> extends Observable<T> {
    constructor(defaultValue: T) {
        super(observer => {
            observer.next(defaultValue)
        })
        this.lastValue = defaultValue
    }

    subscribe(...args) {
        const sub: Subscription = Observable.prototype.subscribe.apply(this, args)
        if (typeof args[0] === 'object' && args[0] !== null) {
            const observer: Observer<T> = args[0]
            if (this.lastValue !== undefined) {
                dispatch(() => {
                    if (sub.closed) return
                    observer.next(this.lastValue)
                }, DispatcherPriorities.OBSERVABLE)
            }
        } else if (typeof args[0] === 'function') {
            const next: ValueListener<T> = args[0]
            if (this.lastValue !== undefined) {
                dispatch(() => {
                    if (sub.closed) return
                    next(this.lastValue)
                }, DispatcherPriorities.OBSERVABLE)
            }
        }
        return sub
    }
}
