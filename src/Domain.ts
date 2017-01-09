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

    public static create<T, U extends { [id: string]: () => Promise<void> | void }, V extends {}>
        (stream: Observable<T>, actions?: U, fields?: V) {
        const instance = (new Domain(stream) as Object)
        if (actions) {
            for (let actionsKey in actions) {
                if (!Object.prototype.hasOwnProperty.call(actions, actionsKey)) {
                    continue
                }
                instance[(actionsKey as string)] =
                    (...args) =>
                        dispatchPromise(actions[actionsKey].bind(instance, ...args))
            }
        }
        if (fields) {
            for (let fieldsKey in fields) {
                if (!Object.prototype.hasOwnProperty.call(fields, fieldsKey)) {
                    continue
                }
                instance[(fieldsKey as string)] = fields[fieldsKey]
            }
        }
        return (instance as Domain<T> & U & V)
    }
}
