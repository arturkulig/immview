import { OrderedSet } from 'immutable';

let isRunning = false;
let queue = OrderedSet();
const errorPrefix = 'Immview::Queue: ';

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

const Dispatcher = {
    /**
     * Append new action onto end of the queue
     * @param {number} priority (higher number - quicker execution)
     * @param {Function} action
     * @param {*} context
     * @param {Array.<*>} args
     */
    appendToQueue(priority = PRIORITY_DOMAIN, action, context, args) {
        queue = queue.add({
            priority,
            action,
            context,
            args,
        });
    },

    runInQueue(priority, action, context, args) {
        Dispatcher.appendToQueue(priority, action, context, args);
        Dispatcher.startQueue();
    },

    /**
     * Removes all queued actions tied with a context
     * @param context
     */
    rejectContext(context) {
        queue = queue.filter(item => item.context !== context);
    },

    /**
     * Starts executing the queue
     */
    startQueue() {
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
