import { DispatcherPriorities } from './DispatcherPriorities'
import { dispatchPromise } from './DispatcherInstance'

export function action(target, propertyKey: string, descriptor: PropertyDescriptor) {
    const actionPerformer: Function = descriptor.value
    descriptor.value = function (...args) {
        return dispatchPromise(
            () => { actionPerformer.apply(this, args) },
            DispatcherPriorities.DOMAIN
        )
    }
}
