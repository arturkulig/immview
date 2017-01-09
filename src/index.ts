import { Dispatcher } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
import { Observable } from './Observable'
import { Origin } from './Origin'
import { Merge } from './Merge'
import { Domain } from './Domain'
import { action } from './Domain.action'

const dispatchExt = (job: () => any) => {
    Dispatcher.push(job, DispatcherPriorities.EXTERNAL)
}

export {
    Observable,
    Origin,
    Merge,
    Domain,
    dispatchExt as dispatch,
    action
}
