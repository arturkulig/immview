import {
    Set,
    is,
} from 'immutable';

const hasValue = v => (
    v !== undefined &&
    v !== null
);

const shouldStructureBeReplaced = (structure, candidate) => {
    return (
        hasValue(candidate) && (
            !hasValue(structure) ||
            is(candidate, structure) === false
        )
    );
};

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
};
