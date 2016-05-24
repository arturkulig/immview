let isRunning = false;
let queue = [];
const errorPrefix = 'Immview::Dispatcher: ';

const PRIORITY_EXT = 0;
const PRIORITY_DOMAIN = 1;
const PRIORITY_DATA_WRITE = 2;
const PRIORITY_DATA_CONSUMING = 3;

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

function shiftFromQueue() {
    const toRun = findMaxPriority();
    queue.splice(
        queue.indexOf(toRun),
        1
    );
    return toRun;
};

/**
 * Execute first action of current queue
 */
const runFirstQueuedItem = () => {
    const task = shiftFromQueue();
    if (task) {
        const {
            context,
            action,
            args,
        } = task;
        action && action.apply(context, args);
    }
};

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

export function dispatch(action, context, args, priority) {
    appendToQueue(action, context, args, priority);
    startQueue();
}

export function dispatchDomainAction(action, context, args) {
    dispatch(action, context, args, PRIORITY_DOMAIN);
}

export function dispatchDataWrite(action, context, args) {
    dispatch(action, context, args, PRIORITY_DATA_WRITE);
}

export function dispatchDataConsume(action, context, args) {
    dispatch(action, context, args, PRIORITY_DATA_CONSUMING);
}

export function dispatchExternal(action, context, args) {
    dispatch(action, context, args, PRIORITY_EXT);
}

/**
 * Removes all queued actions tied with a context
 * @param context
 */
export function rejectContext(context) {
    queue = queue.filter(item => item.context !== context);
}

export const Dispatcher = {

    /**
     * Place provided function on a queue and run it as soon as possible
     * @param {function} action
     * @param {*} [context]
     * @param {Array.<*>} [args]
     * @param {number} [priority=0] priority for dispatched action. 0, 1, 2 are acceptable
     */
    dispatch: dispatchExternal,

    tick(func) {
        func();
    },

    rejectContext,

    logger: console,
};

export default Dispatcher;
