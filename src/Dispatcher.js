let isRunning = false;
let queue = [];
const errorPrefix = 'Immview::Dispatcher: ';

const PRIORITY_EXT = 0;
const PRIORITY_DOMAIN = 1;
const PRIORITY_DATA_WRITE = 2;
const PRIORITY_DATA_PUSH = 3;

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

// function findJob(priority) {
//     for (let i = 0; i < queue.length; i++) {
//         if (queue[i].priority === priority) {
//             return queue[i];
//         }
//     }
// }

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
    const {
        context,
        action,
        args,
    } = shiftFromQueue();
    action.apply(context, args);
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

    isRunning = true;

    while (queue.length > 0) {
        try {
            Dispatcher.tick(runFirstQueuedItem);
        } catch (e) {
            logError(e);
        }
    }

    isRunning = false;
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

export function dispatchDataPush(action, context, args) {
    dispatch(action, context, args, PRIORITY_DATA_PUSH);
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
