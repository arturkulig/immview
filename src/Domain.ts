import { Observable } from './Observable'
import { DispatcherPriorities } from './DispatcherPriorities'
import { dispatchPromise } from './DispatcherInstance'

interface Actions {
    [id: string]: () => void
}

export class Domain<T> extends Observable<T> {
    constructor(
        stream: Observable<T>
    ) {
        super(observer => {
            stream.subscribe(observer.next, observer.error, observer.complete)
        })
    }

    public static create<T, U extends { [id: string]: () => void }, V extends {}>
        (stream: Observable<T>, actions?: U, fields?: V) {
        const instance = (new Domain(stream) as Object)
        if (actions) for (let key in actions) {
            if (!Object.prototype.hasOwnProperty.call(actions, key)) continue
            instance[(key as string)] =
                (...args) =>
                    dispatchPromise(actions[key].bind(instance, ...args))
        }
        if (fields) for (let key in fields) {
            if (!Object.prototype.hasOwnProperty.call(fields, key)) continue
            instance[(key as string)] = fields[key]
        }
        return (instance as Domain<T> & U & V)
    }
}
