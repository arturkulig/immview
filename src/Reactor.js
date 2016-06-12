import {
    is,
} from 'immutable';

import * as Digest from './Digest';

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
}

Reactor.prototype = {
    read() {
        return this.structure;
    },

    /**
     * @param {Reactor|Domain} sourceNode
     */
    linkTo(sourceNode) {
        Digest.link(
            sourceNode && (sourceNode.stream ? sourceNode.stream : sourceNode),
            this
        );
    },

    unlink() {
        Digest.unlink(this);
    },

    /**
     * @param {*|null|undefined} data
     * @optional
     * @param {function()|null} chew
     */
    consume(data, chew = identity) {
        Digest.queue(this, () => this.digest(chew(data)));
    },

    /**
     * @param {*|null|undefined} data
     */
    digest(data) {
        if (shouldStructureBeReplaced(this.structure, data)) {
            this.structure = data;
            this.flush();
        }
    },

    /**
     * @param {function} reaction
     * @returns {function()}
     */
    appendReactor(reaction) {
        if (this._reactors.indexOf(reaction) < 0) {
            this._reactors.push(reaction);
        }
        return () => {
            this._reactors = this._reactors.filter(registeredReaction => registeredReaction !== reaction);
        };
    },

    /**
     * @param {function} reaction
     * @returns {function()}
     */
    subscribe(reaction) {
        reaction(this.read());
        return this.appendReactor(reaction);
    },

    flush() {
        this._reactors.forEach(reaction => reaction(this.read()));
    },

    destroy() {
        this.unlink();
        this.structure = null;
        this._reactors = [];
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

function hasValue(v) {
    return (
        v !== undefined &&
        v !== null
    );
}

function shouldStructureBeReplaced(structure, candidate) {
    return (
        hasValue(candidate) && (
            !hasValue(structure) ||
            !is(candidate, structure)
        )
    );
};

function identity(v) {
    return v;
}
