import { OrderedSet } from 'immutable';

let isRunning = false;
let queue = OrderedSet();
const errorPrefix = 'Immview::Dispatcher: ';

const PRIORITY_EXT = 0;
const PRIORITY_DOMAIN = 1;
const PRIORITY_DATA = 2;

const shiftFromQueue = () => {
    const toRun = (
        queue.find(item => item.priority === PRIORITY_DATA) ||
        queue.find(item => item.priority === PRIORITY_DOMAIN) ||
        queue.find(item => item.priority === PRIORITY_EXT)
    );
    queue = queue.delete(toRun);
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
    queue = queue.add({
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

    while (queue.count() > 0) {
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

export function dispatchDataPush(action, context, args) {
    dispatch(action, context, args, PRIORITY_DATA);
}

export function dispatchExt(action, context, args) {
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
    dispatch: dispatchExt,

    tick(func) {
        func();
    },

    rejectContext,

    logger: console,
};

export default Dispatcher;
