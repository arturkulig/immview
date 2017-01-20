import { Dispatcher } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
import { Observable } from './Observable'
import { Combine } from './Combine'
import { Domain } from './Domain'
import { action } from './Domain.action'

const dispatchExt = (job: () => any) => {
    Dispatcher.push(job, DispatcherPriorities.EXTERNAL)
}

export {
    Observable,
    Combine,
    Combine as Merge,
    Domain,
    Dispatcher,
    dispatchExt as dispatch,
    action
}
