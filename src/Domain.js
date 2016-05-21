import {
    dispatchDomainAction,
    rejectContext,
} from './Dispatcher.js';

const noop = () => null;

const errorPrefix = 'Immview::Domain: ';

/**
 * Create a domain holding a view
 * @param {Reactor} stream
 * @optional
 * @param {Object.<function>} actions
 */
export default function Domain(stream, actions) {
    if (stream.subscribe) {
        this.stream = stream;
    } else {
        throw new Error(`${errorPrefix} stream source required`);
    }
    this._claimActions(actions);
}

Domain.prototype = {
    /**
     * @private
     */
    _claimActions(actions) {
        /**
         * @private
         */
        this._actionNames = actions ? Object.keys(actions) : [];

        this._actionNames.forEach((actionName) => {
            if (this[actionName]) {
                throw new Error(`${errorPrefix}${actionName} is reserved for Domain interface`);
            }

            if (typeof actions[actionName] !== 'function') {
                throw new Error(`${errorPrefix}${actionName} action is not a function`);
            }

            this[actionName] = (...args) => {
                dispatchDomainAction(actions[actionName], this, args, 1);
            };
        });
    },

    /**
     * Retrieve last value on stream attached to the Domain
     * @returns {Iterable}
     */
    read() {
        return this.stream.read();
    },

    // WRITE ?
    // no write method now and in the future
    // as it would encourage developers
    // to modify domain data
    // outside of the domain scope

    /**
     * Create a new stream from a stream attached to the Domain
     * @param {function(Iterable)} nextProcessor
     * @returns {View}
     */
    map(nextProcessor) {
        return this.stream.map(nextProcessor);
    },

    /**
     * Create a new stream that will not trigger its subscriptions
     * until given amount of miliseconds will pass from last call
     * @param {number} timeout
     * @returns {Debounce}
     */
    debounce(timeout) {
        return this.stream.debounce(timeout);
    },

    /**
     * Create a new stream
     * that will not trigger its subscriptions immediately,
     * but defers updates for a number of miliseconds
     * provided with timeout argument
     * after first call
     * @param {number} timeout
     * @returns {Throttle}
     */
    throttle(timeout) {
        return this.stream.throttle(timeout);
    },

    /**
     * Register a listener to changes on data stream.
     * Calls provided method upon registration.
     * @param reaction
     * @returns {function()} unsubscribe
     */
    subscribe(reaction) {
        return this.stream.subscribe(reaction);
    },

    /**
     * Register a listener to changes on data stream.
     * @param reaction
     * @returns {function()} unsubscribe
     */
    appendReactor(reaction) {
        return this.stream.appendReactor(reaction);
    },

    /**
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
