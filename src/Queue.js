import * as I from 'immutable';

let isRunning = false;
let queue = I.OrderedSet();

/**
 * Returns a function that is queueable version of provided one.
 * @param {Function} action
 * @param {*} [context]
 * @returns {Function}
 */
function createAction(action, context) {
    return (...args) => {
        appendToQueue(action, context, args);
        run();
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
function run() {
    if (isRunning) {
        return;
    }

    isRunning = true;

    while (queue.count() > 0) {
        try {
            runFirst();
        } catch (e) {
            console.error('Immview.Queue run - Error occured while running running a function');
            console.error(e.message);
        }
    }

    isRunning = false;
}

/**
 * Execute first action of current queue
 */
function runFirst() {
    let toRun = shiftFromQueue();
    let {
        context,
        action,
        args,
        } = toRun;
    action.apply(context, args);
}

export default {
    createAction,
    rejectContext,
};
