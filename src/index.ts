import { dispatcher, dispatch, flush } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
import { Observable } from './Observable'
import { Combine } from './Combine'
import { Domain } from './Domain'
import { action } from './Domain.action'
import { diagnose } from './Diagnose'

const dispatchExt = (job: () => any, priority = DispatcherPriorities.EXTERNAL) => {
    dispatch(job, priority)
}

export {
    Observable,
    Combine,
    Combine as Merge, // remove after RC
    Domain,

    dispatcher,
    dispatchExt as dispatch,
    DispatcherPriorities as priorities,
    flush,

    action,
    diagnose
}
