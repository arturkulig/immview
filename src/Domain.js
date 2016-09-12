//@flow
import {
    dispatchDomainAction,
    rejectContext,
} from './Dispatcher.js';
import Observable from './Observable';
const noop = () => null;

const errorPrefix = 'Immview::Domain: ';

/*
 * Create a domain holding a view
 */
export default function Domain(stream: Observable, actions: { [id: string]: () => any}) {
    if (!stream.subscribe) {
        throw new Error(`${errorPrefix} stream source required`);
    }
    /*
     */
    this.stream = stream;
    assignActions(this, actions);
}

Domain.prototype = {
    /*
     * Retrieve last value on stream attached to the Domain
     */
    read() {
        return this.stream.read();
    },

    // WRITE ?
    // no write method now and in the future
    // as it would encourage developers
    // to modify domain data
    // outside of the domain scope

    /*
     * Create a new stream from a stream attached to the Domain
     */
    map(nextProcessor) {
        return this.stream.map(nextProcessor);
    },

    /*
     * Create a new stream that will not trigger its subscriptions
     * until given amount of miliseconds will pass from last call
     */
    debounce(timeout: number) {
        return this.stream.debounce(timeout);
    },

    /*
     * Create a new stream
     * that will not trigger its subscriptions immediately,
     * but defers updates for a number of miliseconds
     * provided with timeout argument
     * after first call
     */
    throttle(timeout: number) {
        return this.stream.throttle(timeout);
    },

    scan(valuesToRemember, initialValue) {
        return this.stream.scan(valuesToRemember, initialValue);
    },

    /*
     * Register a listener to changes on data stream.
     * Calls provided method upon registration.
     */
    subscribe(reaction) {
        return this.stream.subscribe(reaction);
    },

    /*
     * Register a listener to changes on data stream.
     */
    addSubscription(reaction) {
        return this.stream.addSubscription(reaction);
    },

    /*
     * Remove all subscriptions caused by the domain.
     * Destroy stream attached to it.
     * Cancel all currently dispatched actions.
     */
    destroy() {
        // destroy and unmount a structure
        this.stream.destroy();
        this.stream = null;

        // remove all queued actions
        rejectContext(this);

        // unmount all domain methods
        this._actionNames.forEach((actionName) => {
            this[actionName] = noop;
        });
        this._actionNames = null;
    },
};

function assignActions(ctx, actions) {
    if (!actions) {
        ctx.actions = () => [];
        return;
    }
    const actionNames = Object.keys(actions);

    actionNames.forEach((actionName) => {
        const action = actions[actionName];

        if (ctx[actionName] !== undefined) {
            throw new Error(`${errorPrefix}${actionName} is reserved for Domain interface`);
        }

        if (typeof action !== 'function') {
            throw new Error(`${errorPrefix}${actionName} action is not a function`);
        }

        ctx[actionName] = (...args) => {
            dispatchDomainAction(action, ctx, args);
        };

        ctx[actionName].originalLength = action.length || action.originalLength;
    });

    ctx._actionNames = actionNames; //legacy TODO remove
    ctx.actions = () => actionNames;
}
