import Dispatcher from './Dispatcher.js';

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
        throw new Error(`${errorPrefix}Data or View stream source required`);
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
                Dispatcher.runInQueue(1, actions[actionName], this, args);
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

    /**
     * Create a new stream from a stream attached to the Domain
     * @param {function(Iterable)} nextProcessor
     * @returns {View}
     */
    map(nextProcessor) {
        return this.stream.map(nextProcessor);
    },

    /**
     * Create a new stream that will not trigger its subscription
     * until given amount of miliseconds will pass
     * @param {number} timeout
     * @returns {View}
     */
    debounce(timeout) {
        return this.stream.debounce(timeout);
    },

    // WRITE ?
    // no write method now and in the future
    // as it would encourage developers
    // to modify domain data
    // outside of the domain scope

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
        Dispatcher.rejectContext(this);

        // unmount all domain methods
        this._actionNames.forEach((actionName) => {
            this[actionName] = noop;
        });
        this._actionNames = null;
    },
};
