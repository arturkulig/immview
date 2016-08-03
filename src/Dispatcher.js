let isRunning = false;
let queue = [];
const errorPrefix = 'Immview::Dispatcher: ';

const PRIORITY_EXT = 0;
const PRIORITY_DOMAIN = 1;
const PRIORITY_DATA_WRITE = 2;
const PRIORITY_DATA_CONSUMING = 3;

const Dispatcher = {
    dispatch: dispatchExternal,

    tick(func) {
        func();
    },

    rejectContext,

    logger: console,
};

export {
    Dispatcher as default,
    Dispatcher,
    dispatch,
    dispatchDomainAction,
    dispatchDataWrite,
    dispatchDataConsume,
    dispatchExternal,
    rejectContext,
};

/**
 * Execute first action of current queue
 */
function runFirstQueuedItem() {
    const task = shiftFromQueue();
    if (task) {
        const {
            context,
            action,
            args,
        } = task;
        action && action.apply(context, args);
    }
}

function shiftFromQueue() {
    const toRun = findMaxPriority();
    queue.splice(
        queue.indexOf(toRun),
        1
    );
    return toRun;
}

function findMaxPriority() {
    let maxPriority = -1;
    let firstOfPriority = null;
    for (let i = 0; i < queue.length; i++) {
        const jobPriority = queue[i].priority;
        if (jobPriority > maxPriority) {
            firstOfPriority = queue[i];
            maxPriority = jobPriority;
        }
    }
    return firstOfPriority;
}

/**
 * Append new action onto end of the queue
 * @param {Function} action
 * @param {*} context
 * @param {Array.<*>} args
 * @param {number} priority (higher number - sooner execution)
 */
function appendToQueue(action, context = null, args = [], priority = PRIORITY_EXT) {
    queue.push({
        priority,
        action,
        context,
        args,
    });
}

function dispatchDomainAction(action, context, args) {
    dispatch(action, context, args, PRIORITY_DOMAIN);
}

function dispatchDataWrite(action, context, args) {
    dispatch(action, context, args, PRIORITY_DATA_WRITE);
}

function dispatchDataConsume(action, context, args) {
    dispatch(action, context, args, PRIORITY_DATA_CONSUMING);
}

function dispatchExternal(action, context, args) {
    dispatch(action, context, args, PRIORITY_EXT);
}

/**
 * Place provided function on a queue and run it as soon as possible
 * @param {function} action
 * @param {*} [context]
 * @param {Array.<*>} [args]
 * @param {number} [priority=0] priority for dispatched action.
 */
function dispatch(action, context, args, priority) {
    appendToQueue(action, context, args, priority);
    startQueue();
}

/**
 * Starts executing the queue
 */
function startQueue() {
    if (isRunning) {
        return;
    }

    if (queue.length > 0) {
        isRunning = true;
        Dispatcher.tick(() => {
            try {
                runFirstQueuedItem();
            } catch (e) {
                logError(e);
            }
            isRunning = false;
            startQueue();
        });
    }
}

function logError(e) {
    Dispatcher.logger.error(`${errorPrefix}Error occured while running a function`);
    if (typeof e === 'object') {
        if (e.stack) {
            Dispatcher.logger.error(e.stack);
        } else {
            Dispatcher.logger.error(e.name, e.message);
        }
    } else {
        Dispatcher.logger.error(e);
    }
}

/**
 * Removes all queued actions tied with a context
 * @param context
 */
function rejectContext(context) {
    queue = queue.filter(item => item.context !== context);
}
