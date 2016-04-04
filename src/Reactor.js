import {
    Set,
    is,
} from 'immutable';

function hasValue(v) {
    return (
        v !== undefined &&
        v !== null
    );
}

const emptySet = Set();

export default class Reactor {
    constructor() {
        /**
         * @private
         */
        this.reactors = emptySet;
        /**
         * @private
         * @type {Iterable}
         */
        this.structure = undefined; //yet declared
    }

    get isReactor() {
        return true;
    }

    /**
     * @param {function} reaction
     * @returns {function()}
     */
    appendReactor(reaction) {
        this.reactors = this.reactors.add(reaction);
        return () => {
            this.reactors = this.reactors.delete(reaction);
        };
    }

    /**
     * @param {function} reaction
     * @returns {function()}
     */
    subscribe(reaction) {
        reaction(this.structure);
        return this.appendReactor(reaction);
    }

    digest(data) {
        if (
            hasValue(data) && (
                !hasValue(this.structure) ||
                is(data, this.structure) === false
            )
        ) {
            this.structure = data;
            this.flush();
        }
    }

    flush() {
        this.reactors.forEach(reactor => reactor(this.structure));
    }

    destroyReactor() {
        this.structure = null;
        this.reactors = emptySet;
    }

    destroy() {
        this.destroyReactor();
    }

    read() {
        return this.structure;
    }
}
