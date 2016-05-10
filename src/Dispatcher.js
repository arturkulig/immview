import { OrderedSet } from 'immutable';

let isRunning = false;
let queue = OrderedSet();
const errorPrefix = 'Immview::Dispatcher: ';

const PRIORITY_DOMAIN = 1;
const PRIORITY_DATA = 2;

const shiftFromQueue = () => {
    const toRun = (
        queue.find(item => item.priority === PRIORITY_DATA) ||
        queue.find(item => item.priority === PRIORITY_DOMAIN)
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
 * @param {number} priority (higher number - quicker execution)
 * @param {Function} action
 * @param {*} context
 * @param {Array.<*>} args
 */
function appendToQueue(action, context, args, priority = PRIORITY_DOMAIN) {
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
            Dispatcher.logError(e);
        }
    }

    isRunning = false;
}

const Dispatcher = {

    /**
     * Place provided function on a queue and run it as soon as possible
     * @param {function} action
     * @param {*} context
     * @param {Array.<*>} args
     * @param {1|2} priority
     */
    dispatch(action, context, args, priority) {
        appendToQueue(action, context, args, priority);
        startQueue();
    },

    /**
     * Removes all queued actions tied with a context
     * @param context
     */
    rejectContext(context) {
        queue = queue.filter(item => item.context !== context);
    },

    tick(func) {
        func();
    },

    logError(e) {
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
    },
};

export default Dispatcher;
