import {
    dispatchDataWrite,
    dispatchDataConsume,
} from './Dispatcher';

const schedule = [];

export function queue(observable, data, process) {
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
        observable._digest(process(data));
        processQueue();
    }
}
