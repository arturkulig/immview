// TODO replace with Observable
import { BaseObservable } from './BaseObservable'
import { DispatcherPriorities } from './DispatcherPriorities'
import { Dispatcher } from './DispatcherInstance'

export class Domain<T> {
    constructor(private stream: BaseObservable<T>) { }

    public static new
        <T, U extends { [id: string]: () => Promise<any> | void }>
        (stream: BaseObservable<T>, actions?: U): Domain<T> & U {
        const instance = (Domain.call(this || {}, stream) as Domain<T>)
        Object.keys(actions).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(actions, key)) return
            if (!instance[key]) {
                throw new Error(`Domain cannot receive action called ${key} as it is already used.`)
            }
            if (typeof actions[key] === 'function') {
                const action = actions[key]
                instance[key] = (...args) => {
                    const done = Dispatcher.push(
                        action.bind.apply(undefined, [this, args]),
                        DispatcherPriorities.DOMAIN
                    )
                    Dispatcher.run()
                    return done
                }
            } else {
                instance[key] = actions[key]
            }
        })
        return (instance as Domain<T> & U)
    }
}

Domain.new(
    new BaseObservable(null),
    {
        oh() {
            return Promise.resolve(5)
        }
    }
)
