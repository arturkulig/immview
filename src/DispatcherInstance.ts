import { Dispatcher } from './Dispatcher'
import { DispatcherPriorities } from './DispatcherPriorities'

const DispatcherInstance = new Dispatcher()
const dispatch = (job: () => any, priority: DispatcherPriorities = DispatcherPriorities.EXTERNAL) => {
    DispatcherInstance.push(job, priority)
    DispatcherInstance.run()
}
const dispatchPromise = (job: () => any, priority: DispatcherPriorities = DispatcherPriorities.EXTERNAL) => {
    return new Promise<void>((resolve, reject) => {
        dispatch(() => {
            try {
                resolve(job())
            } catch (e) {
                console.error(e.stack || e.message || e)
                reject(e)
            }
        }, priority)
    })
}

export {
    DispatcherInstance as Dispatcher,
    dispatch,
    dispatchPromise
}
