import { dispatcher } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
import { Observable } from './Observable'
import { Combine } from './Combine'
import { Domain } from './Domain'
import { action } from './Domain.action'
import { diagnose } from './Diagnose'

const dispatchExt = (job: () => any) => {
    dispatcher.push(job, DispatcherPriorities.EXTERNAL)
}

export {
    Observable,
    Combine,
    Combine as Merge,
    Domain,
    dispatcher,
    dispatchExt as dispatch,
    action,
    diagnose
}
