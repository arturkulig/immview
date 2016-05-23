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
} from './streamScheduler';

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

let digestLinks = [];
let digestQueue = [];

function restoreNodeJobs(edges, currentSchedule) {
    const digestJobMap = createSchedule(edges);
    return copyQueueOntoSchedule(currentSchedule, digestJobMap);
}

import {
    dispatchDataWrite,
    dispatchDataPush,
} from './Dispatcher';

function doNextJob() {
    if (scheduleLength(digestQueue) > 0) {
        digestQueue = runScheduledPriorityJob(digestQueue);
        dispatchDataWrite(doNextJob);
    }
}

export default function Reactor() {
    /**
     * @private
     */
    this.reactors = Set();
}

Reactor.resetDigest = () => {
    digestLinks = [];
    digestQueue = [];
};

Reactor.prototype = {
    read() {
        return this.structure;
    },

    linkTo(sourceNode) {
        digestLinks.push([sourceNode, this]);
        digestQueue = restoreNodeJobs(digestLinks, digestQueue);
    },

    unlink() {
        digestLinks = digestLinks.filter(link => link[0] !== this && link[1] !== this);
        digestQueue = restoreNodeJobs(digestLinks, digestQueue);
    },

    consume(data, chew = v => v) {
        dispatchDataPush(() => {
            digestQueue = scheduleJob(this, () => this.digest(chew(data)), digestQueue);
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
