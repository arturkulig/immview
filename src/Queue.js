import * as I from 'immutable';

let isRunning = false;
let queue = I.OrderedSet();
const errorPrefix = 'Immview::Queue: ';

export default {
    createAction,
    rejectContext,
    runInQueue,
};

/**
 * Returns a function that is queueable version of provided one.
 * @param {Function} action
 * @param {*} [context]
 * @returns {Function}
 */
function createAction(action, context) {
    return (...args) => {
        runInQueue(action, context, args);
    };
}

/**
 * Append new action onto end of the queue
 * @param {Function} action
 * @param {*} context
 * @param {Array.<*>} args
 */
function appendToQueue(action, context, args) {
    queue = queue.add({
        action,
        context,
        args,
    });
}

function runInQueue(action, context, args) {
    appendToQueue(action, context, args);
    startQueue();
}

/**
 * Removes and returns first action from the queue and
 * @returns {{action:Function,context,args:Array.<*>}}
 */
function shiftFromQueue() {
    let toRun = queue.first();
    queue = queue.rest();
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
    const toRun = shiftFromQueue();
    const {
        context,
        action,
        args,
        } = toRun;
    action.apply(context, args);
}
