import { dispatcher, dispatch, flush } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
import {
    ValueListener,
    ErrorListener,
    CompletionListener
} from './BaseObservable'
import { Observable, NO_VALUE } from './Observable'
import { Combine } from './Combine'
import { Domain } from './Domain'
import { Subscription } from './Subscription'
import { action } from './Domain.action'
import { diagnose } from './Diagnose'

const dispatchExt = (job: () => any, priority = DispatcherPriorities.EXTERNAL) => {
    dispatch(job, priority)
}

export {
    Observable,
    Combine,
    Domain,

    NO_VALUE,

    dispatcher,
    dispatchExt as dispatch,
    DispatcherPriorities as priorities,
    flush,

    action,
    diagnose,

    Subscription,
    ValueListener,
    ErrorListener,
    CompletionListener
}
