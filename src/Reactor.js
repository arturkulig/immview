import {
    is,
} from 'immutable';

import * as Digest from './Digest';
import * as Dispatcher from './Dispatcher';

/**
 * Reactor is an base class for all immview observables
 * @constructor
 */
export default function Reactor() {
    /**
     * @private
     * @type {Function[]}
     */
    this._reactors = [];
    /**
     * @public
     * @type {boolean}
     */
    this.closed = false;
}

Reactor.prototype = {
    read() {
        return this.structure;
    },

    /**
     * Registers new connection between new observables
     * @protected
     * @param {Reactor|Domain} sourceNode
     */
    _linkTo(sourceNode) {
        Digest.link(
            sourceNode && (sourceNode.stream ? sourceNode.stream : sourceNode),
            this
        );
    },

    /**
     * Unregisters connections between observables
     * @protected
     */
    _unlink() {
        Digest.unlink(this);
    },

    /**
     * Defers a digestion with a function
     * that can be relaced
     * without any data loss
     * @protected
     * @param {*|null|undefined} data
     * @optional
     * @param {function()|null} chew
     */
    _consume(data, chew = identity) {
        Digest.queue(this, () => this._digest(chew(data)));
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
        this._reactors.forEach(reaction => reaction(data));
    },

    /**
     * Registers a function that is going to be fed with new data pushing by this observable
     * @param {function} reaction
     * @returns {function()}
     */
    appendReactor(reaction) {
        if (this._reactors.indexOf(reaction) < 0) {
            this._reactors.push(reaction);
        }
        return () => {
            this._reactors = this._reactors.filter(
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
        return this.appendReactor(reaction);
    },

    destroy() {
        Dispatcher.rejectContext(this);
        this._unlink();
        this.structure = null;
        this._reactors = [];
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
