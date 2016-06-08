import {
    scheduleLength,
    scheduleJob,
    runScheduledPriorityJob,
    createSchedule,
    copyQueueOntoSchedule,
} from './Schedule';

import {
    dispatchDataWrite,
    dispatchDataConsume,
} from './Dispatcher';

let digestEdges = [];

let digestSchedule = [];

const Digest = {
    link,
    unlink,
    queue,
};

export default Digest;

function queue(node, job) {
    dispatchDataConsume(
        () => {
            setSchedule(scheduleJob(node, job, getSchedule()));
            processQueue();
        }
    );
}

function processQueue() {
    dispatchDataWrite(executeNextJob);
}

function link(source, target) {
    setGraph(getGraph().concat([[source, target]]));
}

function unlink(item) {
    setGraph(getGraph().filter(([source, target]) => source !== item && target !== item));
}

function getGraph() {
    return digestEdges;
}

function setGraph(edges) {
    digestEdges = edges;
    setSchedule(restoreNodesJobs(digestEdges, getSchedule()));
}

function restoreNodesJobs(edges, currentSchedule) {
    const digestJobMap = createSchedule(edges);
    return copyQueueOntoSchedule(currentSchedule, digestJobMap);
}

function executeNextJob() {
    if (scheduleLength(getSchedule()) > 0) {
        setSchedule(runScheduledPriorityJob(getSchedule()));
        dispatchDataWrite(executeNextJob);
    }
}

function getSchedule() {
    return digestSchedule;
}

function setSchedule(schedule) {
    digestSchedule = schedule;
}
