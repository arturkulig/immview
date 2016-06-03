import {
    Set,
    is,
} from 'immutable';

import {
    scheduleLength,
    scheduleJob,
    runScheduledPriorityJob,
    createSchedule,
    copyQueueOntoSchedule,
} from './StreamSchedule';

import {
    dispatchDataWrite,
    dispatchDataConsume,
} from './Dispatcher';

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

let digestEdges = [];
let digestSchedule = [];

function restoreNodeJobs(edges, currentSchedule) {
    const digestJobMap = createSchedule(edges);
    return copyQueueOntoSchedule(currentSchedule, digestJobMap);
}

function doNextJob() {
    if (scheduleLength(digestSchedule) > 0) {
        digestSchedule = runScheduledPriorityJob(digestSchedule);
        dispatchDataWrite(doNextJob);
    }
}

function identity(v) {
    return v;
}

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
        digestEdges.push([
            sourceNode && (sourceNode.stream ? sourceNode.stream : sourceNode),
            this,
        ]);
        digestSchedule = restoreNodeJobs(digestEdges, digestSchedule);
    },

    unlink() {
        digestEdges = digestEdges.filter(link => link[0] !== this && link[1] !== this);
        digestSchedule = restoreNodeJobs(digestEdges, digestSchedule);
    },

    consume(data, chew = identity) {
        dispatchDataConsume(() => {
            digestSchedule = scheduleJob(this, () => this.digest(chew(data)), digestSchedule);
            dispatchDataWrite(doNextJob);
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
