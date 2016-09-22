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

    map(...args) {
        return this.stream.map.apply(this.stream, args);
    },

    debounce(...args) {
        return this.stream.debounce.apply(this.stream, args);
    },

    throttle(...args) {
        return this.stream.throttle.apply(this.stream, args);
    },

    scan(...args) {
        return this.stream.scan.apply(this.stream, args);
    },

    reduce(...args) {
        return this.stream.reduce.apply(this.stream, args);
    },

    subscribe(...args) {
        return this.stream.subscribe.apply(this.stream, args);
    },

    addSubscription(...args) {
        return this.stream.addSubscription.apply(this.stream, args);
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
