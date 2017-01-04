import { Dispatcher } from './Dispatcher'
import { DispatcherPriorities } from './DispatcherPriorities'

const DispatcherInstance = new Dispatcher()
const dispatch = (job: () => any, priority: DispatcherPriorities) => {
    DispatcherInstance.push(job, priority)
    DispatcherInstance.run()
}

export {
    DispatcherInstance as Dispatcher,
    dispatch
}
