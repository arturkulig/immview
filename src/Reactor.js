import {
    OrderedMap,
    Set,
    is,
} from 'immutable';

import {
    getGraphFromEdges,
    sortJobs,
    appendJob,
    runDigestQueue,
} from './streamScheduler';

import { dispatchDataPush } from './Dispatcher';

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

let links = [];
let digestGraph;
let digestQueue = OrderedMap();

function nextDigest() {
    dispatchDataPush(() => {
        if (digestQueue.count() > 0) {
            digestQueue = runDigestQueue(digestQueue);
            if (digestQueue.count() > 0) {
                nextDigest();
            }
        }
    });
}

Reactor.prototype = {
    read() {
        return this.structure;
    },
    
    linkTo(sourceNode) {
        links.push([sourceNode, this]);
        digestGraph = getGraphFromEdges(links);
    },
    
    unlink() {
        links = links.filter(link => link[0] !== this && link[1] !== this);
        digestGraph = getGraphFromEdges(links);
    },
    
    consume(data, chew = v => v) {
        dispatchDataPush(() => {
            digestQueue = sortJobs(
                digestGraph,
                appendJob(this, () => this.digest(chew(data)), digestQueue)
            );
            nextDigest();
        });
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
};
