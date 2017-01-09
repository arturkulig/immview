import { Dispatcher } from './Dispatcher';
import { DispatcherPriorities } from './DispatcherPriorities';
declare const DispatcherInstance: Dispatcher;
declare const dispatch: (job: () => any, priority?: DispatcherPriorities) => void;
declare const dispatchPromise: (job: () => any, priority?: DispatcherPriorities) => Promise<void>;
export { DispatcherInstance as Dispatcher, dispatch, dispatchPromise };
