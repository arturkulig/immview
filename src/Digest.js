//@flow
import {
    dispatchDataWrite,
    dispatchDataConsume,
} from './Dispatcher';
import type Observable from './Observable';

const schedule: {
    observable: Observable,
    data: any,
    process: (subject: any) => any
}[] = [];

export function queue(observable: Observable, data: any, process: (subject: any) => any) {
    dispatchDataConsume(
        () => {
            scheduleObservableConsumption(observable, data, process);
            processQueue();
        }
    );
}

function scheduleObservableConsumption(observable, data, process) {
    for (let i = 0; i < schedule.length; i++) {
        if (schedule[i].observable._id === observable._id) {
            schedule[i].data = data;
            return;
        }
        if (schedule[i].observable._id > observable._id) {
            schedule.splice(i, 0, { observable, data, process });
            return;
        }
    }
    schedule.splice(schedule.length, 0, { observable, data, process });
}

function processQueue() {
    dispatchDataWrite(executeNextJob);
}

function executeNextJob() {
    if (schedule.length) {
        const [{ observable, data, process }] = schedule.splice(0, 1);
        observable.digest(process(data));
        processQueue();
    }
}
