import {
    is,
} from 'immutable';

import * as Digest from './Digest';
import * as Dispatcher from './Dispatcher';

/**
 * Observable is an base class for all immview observables
 * @constructor
 */
export default function Observable() {
    /**
     * @type {number}
     * @private
     */
    this._id = Observable.lastInstanceId++;
    /**
     * @type {Function[]}
     * @private
     */
    this._subscriptions = [];
    /**
     * @type {boolean}
     * @public
     */
    this.closed = false;
}

Observable.lastInstanceId = 0;

Observable.prototype = {
    read() {
        return this.structure;
    },

    /**
     * Defers a digestion with a function
     * that can be relaced
     * without any data loss
     * @protected
     * @param {*|null|undefined} data
     * @optional
     * @param {function()|null} process
     */
    _consume(data, process = identity) {
        Digest.queue(this, data, process);
    },

    /**
     * Replace current state and push data further
     * @param {*|null|undefined} data
     */
    _digest(data) {
        if (shouldStructureBeReplaced(this.structure, data)) {
            this.structure = data;
            this._flush(data);
        }
    },

    /**
     * Pushes data to all listeners
     * @param data
     * @private
     */
    _flush(data) {
        this._subscriptions.forEach(reaction => reaction(data));
    },

    /**
     * Registers a function that is going to be fed with new data pushing by this observable
     * @param {function} reaction
     * @returns {function()}
     */
    addSubscription(reaction) {
        if (this._subscriptions.indexOf(reaction) < 0) {
            this._subscriptions.push(reaction);
        }
        return () => {
            this._subscriptions = this._subscriptions.filter(
                registeredReaction => registeredReaction !== reaction
            );
        };
    },

    /**
     * Registers a function that is going to be fed with new data pushing by this observable.
     * Will launch provided function immediately.
     * @param {function} reaction
     * @returns {function()}
     */
    subscribe(reaction) {
        reaction(this.read());
        return this.addSubscription(reaction);
    },

    destroy() {
        Dispatcher.rejectContext(this);
        this.structure = null;
        this._subscriptions = [];
        Object.defineProperty
            ? Object.defineProperty(this, 'closed', { value: true, writable: false })
            : this.closed = true;
    },

    map(processor) {
        const View = require('./View.js').default;
        return new View(this, processor);
    },

    debounce(timeout) {
        const Debounce = require('./Debounce.js').default;
        return new Debounce(this, timeout);
    },

    throttle(timeout) {
        const Throttle = require('./Throttle.js').default;
        return new Throttle(this, timeout);
    },

    scan(valuesToRemember, initialValue) {
        const Scan = require('./Scan.js').default;
        return new Scan(this, valuesToRemember, initialValue);
    },
};

function shouldStructureBeReplaced(structure, candidate) {
    return (
        hasValue(candidate) && (
            !hasValue(structure) ||
            !is(candidate, structure)
        )
    );
}

function hasValue(v) {
    return (
        v !== undefined &&
        v !== null
    );
}

function identity(v) {
    return v;
}
