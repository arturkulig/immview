import { DispatcherPriorities } from './DispatcherPriorities'
import { dispatchPromise } from './DispatcherInstance'
import { diagnose } from './Diagnose'

export function action(target, propertyKey: string, descriptor: PropertyDescriptor) {
    const actionPerformer: Function = descriptor.value
    descriptor.value = function (...args) {
        return dispatchPromise(
            () => {
                const diagDone = diagnose.measure(`<\$ ${this['name'] ? `${this['name']}.` : ''}${propertyKey}`)
                const result = actionPerformer.apply(this, args)
                diagDone && diagDone()
                return result
            },
            DispatcherPriorities.DOMAIN
        )
    }
}
