import {
    getOrder,
} from './graphSort.js';

export const sortStreamGraph = getOrder;

export function createSchedule(graph) {
    return sortStreamGraph(graph)
        .reduce(
            (jobMap, node) => {
                jobMap.unshift([node, null]);
                return jobMap;
            },
            []
        );
}

export function scheduleJob(contextNode, nodeNewJob, schedule) {
    const newSchedule = [];
    for (let i = 0; i < schedule.length; i++) {
        const entry = schedule[i];
        const currentNode = entry[0];
        if (currentNode === contextNode) {
            newSchedule.push([currentNode, nodeNewJob]);
        } else {
            newSchedule.push(entry);
        }
    }
    return newSchedule;
}

export function scheduleLength(schedule) {
    let length = 0;
    for (let i = 0; i < schedule.length; i++) {
        length += (!!schedule[i][1]) | 0;
    }
    return length;
}

export function findJob(queue, contextNode) {
    for (let i = 0; i < queue.length; i++) {
        if (queue[i][0] === contextNode) {
            return queue[i][1];
        }
    }
    return null;
}

export function copyQueueOntoSchedule(source, target) {
    const result = [].concat(target);
    for (let i = 0; i < source.length; i++) {
        const sourceEntry = source[i];
        const sourceEntryNode = sourceEntry[0];
        const sourceEntryJob = sourceEntry[1];
        
        if (sourceEntryJob) {
            for (let j = 0; j < result.length; j++) {
                const targetEntry = result[j];
                const targetEntryNode = targetEntry[0];
                if (targetEntryNode === sourceEntryNode) {
                    result[j] = sourceEntry;
                }
            }
        }
    }
    return result;
}

export function runScheduledPriorityJob(schedule) {
    let currentJob = null;
    let restOfJobs = [].concat(schedule);
    for (let i = 0; i < schedule.length; i++) {
        const entry = schedule[i];
        const node = entry[0];
        const job = entry[1];
        if (job && !currentJob) {
            currentJob = job;
            restOfJobs[i] = [node, null];
        }
    };
    if (currentJob) {
        currentJob();
    }
    return restOfJobs;
}
