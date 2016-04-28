import Queue from './Queue.js';

const noop = () => null;

const errorPrefix = 'Immview::Domain: ';

export default class Domain {
    /**
     * Create a domain holding a view
     * @param {Reactor} stream
     * @optional
     * @param {Object.<function>} actions
     */
    constructor(stream, actions) {
        this._claimStream(stream);
        this._claimActions(actions);
    }

    /**
     * @private
     */
    _claimStream(stream) {
        if (stream.isReactor) {
            this.stream = stream;
            return;
        }

        throw new Error(`${errorPrefix} provided stream is not inheriting from Reactor class`);
    }

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
                Queue.runInQueue(1, actions[actionName], this, args);
            };
        });
    }

    get structure() {
        return this.read();
    }

    /**
     * Retrieve last value on stream attached to the Domain
     * @returns {Iterable}
     */
    read() {
        return this.stream.read();
    }

    /**
     * Create a new stream from a stream attached to the Domain
     * @param {function(Iterable)} nextProcessor
     * @returns {View}
     */
    map(nextProcessor) {
        return this.stream.map(nextProcessor);
    }

    // WRITE ?
    // no write method now and in the future
    // as it would encourage developers
    // to modify domain data
    // outside of the domain scope

    get isDomain() {
        return true;
    }

    /**
     * Register a listener to changes on data stream.
     * Calls provided method upon registration.
     * @param reaction
     * @returns {function()} unsubscribe
     */
    subscribe(reaction) {
        return this.stream.subscribe(reaction);
    }

    /**
     * Register a listener to changes on data stream.
     * @param reaction
     * @returns {function()} unsubscribe
     */
    appendReactor(reaction) {
        return this.stream.appendReactor(reaction);
    }

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
        Queue.rejectContext(this);

        // unmount all domain methods
        this._actionNames.forEach((actionName) => {
            this[actionName] = noop;
        });
        this._actionNames = null;
    }
}
