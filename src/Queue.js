import { OrderedSet } from 'immutable';

let isRunning = false;
let queue = OrderedSet();
const errorPrefix = 'Immview::Queue: ';

export default {
    runInQueue,
    rejectContext,
};

const PRIORITY_DOMAIN = 1;
const PRIORITY_DATA = 2;

/**
 * Append new action onto end of the queue
 * @param {number} priority (higher number - quicker execution)
 * @param {Function} action
 * @param {*} context
 * @param {Array.<*>} args
 */
function appendToQueue(priority = PRIORITY_DOMAIN, action, context, args) {
    queue = queue.add({
        priority,
        action,
        context,
        args,
    });
}

function runInQueue(priority, action, context, args) {
    appendToQueue(priority, action, context, args);
    startQueue();
}

/**
 * Removes and returns action from the queue
 * @returns {{action:Function,context,args:Array.<*>}}
 */
function shiftFromQueue() {
    const toRun = (
        queue.find(item => item.priority === PRIORITY_DATA) ||
        queue.find(item => item.priority === PRIORITY_DOMAIN)
    );
    queue = queue.delete(toRun);
    return toRun;
}

/**
 * Removes all queued actions tied with a context
 * @param context
 */
function rejectContext(context) {
    queue = queue.filter(item => item.context !== context);
}

/**
 * Starts executing the queue
 */
function startQueue() {
    if (isRunning) {
        return;
    }

    isRunning = true;

    while (queue.count() > 0) {
        try {
            tick(runFirst);
        } catch (e) {
            logError(e);
        }
    }

    isRunning = false;
}

// TODO make it replacable
function tick(func) {
    func();
}

// TODO make it replacable
function logError(e) {
    console.error(`${errorPrefix}Error occured while running a function`);
    if (typeof e === 'object') {
        if (e.stack) {
            console.error(e.stack);
        } else {
            console.error(e.name, e.message);
        }
    } else {
        console.error(e);
    }
}

/**
 * Execute first action of current queue
 */
function runFirst() {
    const {
        context,
        action,
        args,
    } = shiftFromQueue();
    action.apply(context, args);
}
