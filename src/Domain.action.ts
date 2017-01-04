import { DispatcherPriorities } from './DispatcherPriorities'
import { dispatch } from './DispatcherInstance'

export function action(target, propertyKey: string, descriptor: PropertyDescriptor) {
    const actionPerformer: Function = descriptor.value
    descriptor.value = function (...args) {
        return new Promise(resolve => {
            dispatch(() => {
                try {
                    actionPerformer.apply(this, args)
                } catch (e) {
                    console.error(e.stack || e.message || e)
                }
                resolve()
            }, DispatcherPriorities.DOMAIN)
        })
    }
}
