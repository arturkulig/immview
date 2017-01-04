import { Dispatcher } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
import { Observable } from './Observable'
import { Data } from './Data'
import { Merge } from './Merge'
import { Domain } from './Domain'
import { action } from './Domain.action'

const dispatchExt = (job: () => any) => {
    Dispatcher.push(job, DispatcherPriorities.EXTERNAL)
}

export {
    Observable,
    Data,
    Merge,
    Domain,
    dispatchExt as dispatch,
    action
}
