import {
    List,
    OrderedMap,
    OrderedSet,
} from 'immutable';

import {
    addEdge,
    getOrder,
} from './graphSort.js';

export function getGraphFromEdges(edges = []) {
    return List(edges).reduce(
        (result, [sourceNode, targetNode]) => addEdge(sourceNode, targetNode, result),
        OrderedSet()
    );
}

export function appendJob(stream, newJob, jobs = OrderedMap()) {
    return jobs.set(stream, newJob);
}

export function sortJobs(graph, jobs = OrderedMap()) {
    const order = getOrder(graph);
    return jobs.sortBy((job, stream) => (order.indexOf(stream)|0));
}

export function runDigestQueue(jobs = OrderedMap()) {
    if (jobs.count() === 0) {
        return jobs;
    }
    const priorityJob = jobs.first();
    const restOfJobs = jobs.rest();
    if (priorityJob) {
        priorityJob();
    }
    return restOfJobs;
}
