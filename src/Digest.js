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
            dispatchQueueExecution();
        }
    );
}

function scheduleObservableConsumption(observable, data, process) {
    for (let i = 0; i < schedule.length; i++) {
        if (schedule[i].observable.priority === observable.priority) {
            schedule[i].data = data;
            return;
        }
        if (schedule[i].observable.priority > observable.priority) {
            schedule.splice(i, 0, { observable, data, process });
            return;
        }
    }
    schedule.splice(schedule.length, 0, { observable, data, process });
}

function dispatchQueueExecution() {
    dispatchDataWrite(executeQueue);
}

function executeQueue() {
    if (schedule.length) {
        const [{ observable, data, process }] = schedule.splice(0, 1);
        observable.digest(process(data));
        dispatchQueueExecution();
    }
}
