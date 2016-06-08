import {
    Set,
    is,
} from 'immutable';

import Digest from './Digest';

export default function Reactor() {
    /**
     * @private
     */
    this.reactors = Set();
}

Reactor.prototype = {
    read() {
        return this.structure;
    },

    linkTo(sourceNode) {
        Digest.link(
            sourceNode && (sourceNode.stream ? sourceNode.stream : sourceNode),
            this
        );
    },

    unlink() {
        Digest.unlink(this);
    },

    consume(data, chew = identity) {
        Digest.queue(this, () => this.digest(chew(data)));
    },

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
        this.reactors = this.reactors.add(reaction);
        return () => {
            this.reactors = this.reactors.delete(reaction);
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
        this.reactors.forEach(reaction => reaction(this.read()));
    },

    destroy() {
        this.unlink();
        this.structure = null;
        this.reactors = Set();
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
