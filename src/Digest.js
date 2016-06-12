import * as Schedule from './Schedule';

import {
    dispatchDataWrite,
    dispatchDataConsume,
} from './Dispatcher';

let digestEdges = [];

let digestSchedule = [];

export function link(source, target) {
    setGraph(getGraph().concat([[source, target]]));
}

export function unlink(item) {
    setGraph(getGraph().filter(([source, target]) => source !== item && target !== item));
}

export function queue(node, job) {
    dispatchDataConsume(
        () => {
            setSchedule(Schedule.scheduleJob(node, job, getSchedule()));
            processQueue();
        }
    );
}

function processQueue() {
    dispatchDataWrite(executeNextJob);
}

function getGraph() {
    return digestEdges;
}

function setGraph(edges) {
    digestEdges = edges;
    setSchedule(restoreNodesJobs(digestEdges, getSchedule()));
}

function restoreNodesJobs(newEdges, currentSchedule) {
    const digestJobMap = Schedule.createSchedule(newEdges);
    return Schedule.copyQueueOntoSchedule(currentSchedule, digestJobMap);
}

function executeNextJob() {
    if (Schedule.scheduleLength(getSchedule()) > 0) {
        setSchedule(Schedule.runScheduledPriorityJob(getSchedule()));
        dispatchDataWrite(executeNextJob);
    }
}

function getSchedule() {
    return digestSchedule;
}

function setSchedule(schedule) {
    digestSchedule = schedule;
}
