import { dispatcher, dispatch, flush } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
import {
    ValueListener,
    ErrorListener,
    CompletionListener,
    Subscription,
    NO_VALUE,
    Stream,
    OpStream,
} from './Types'
import { Observable } from './Observable'
import { Atom } from './Atom'
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
    Domain,
    Atom,
    Stream,
    OpStream,

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
