// TODO replace with Observable
import { BaseObservable } from './BaseObservable'
import { DispatcherPriorities } from './DispatcherPriorities'
import { Dispatcher } from './DispatcherInstance'

export class Domain<T> {
    constructor(private stream: BaseObservable<T>) { }

    public static new
        <T, U extends { [id: string]: () => Promise<any> }>
        (stream: BaseObservable<T>, actions: U): Domain<T> & U {
        const instance = new Domain(stream)
        Object.keys(actions).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(actions, key)) return
            if (Object.prototype.hasOwnProperty.call(instance, key)) {
                throw new Error(`Domain cannot receive action called ${key} as it is already used.`)
            }
            if (typeof actions[key] === 'function') {
                const action = actions[key]
                instance[key] = (...args) => {
                    const done = Dispatcher.push(
                        action.bind.apply(undefined, [instance, args]),
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
        },
        nope() {
            return null
        }
    }
)
