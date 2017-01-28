import { Dispatcher } from './Dispatcher'
import { DispatcherPriorities } from './DispatcherPriorities'

const DispatcherInstance = new Dispatcher()
const dispatch = (job: () => any, priority: DispatcherPriorities) => {
    DispatcherInstance.push(job, priority)
    DispatcherInstance.run()
}

const dispatchPromise = (job: () => any, priority: DispatcherPriorities) => {
    return new Promise<void>((resolve, reject) => {
        let ok: boolean
        let result
        let error
        dispatch(() => {
            try {
                result = job()
                ok = true
            } catch (e) {
                error = e
                ok = false
            }
        }, priority)
        dispatch(() => {
            ok ? resolve(result) : reject(error)
        }, priority)
    })
}

export {
    DispatcherInstance as dispatcher,
    dispatch,
    dispatchPromise
}
