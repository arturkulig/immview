import {
    dispatchDomainAction,
    rejectContext,
} from './Dispatcher.js';
import Observable from './Observable';
const noop = () => null;

const errorPrefix = 'Immview::Domain: ';

export default function Domain(stream, appendices) {
    this.stream = stream;
    appendToDomainInstance(this, appendices);
}

Domain.prototype = {
    read() {
        return this.stream.read();
    },

    // WRITE ?
    // no write method now and in the future
    // as it would encourage developers
    // to modify domain data
    // outside of the domain scope

    map(...args) {
        return this.stream.map.apply(this.stream, args);
    },

    debounce(...args) {
        return this.stream.debounce.apply(this.stream, args);
    },

    throttle(...args) {
        return this.stream.throttle.apply(this.stream, args);
    },

    scan(...args) {
        return this.stream.scan.apply(this.stream, args);
    },

    reduce(...args) {
        return this.stream.reduce.apply(this.stream, args);
    },

    subscribe(...args) {
        return this.stream.subscribe.apply(this.stream, args);
    },

    addSubscription(...args) {
        return this.stream.addSubscription.apply(this.stream, args);
    },

    destroy() {
        // destroy and unmount a structure
        this.stream.destroy();
        this.stream = null;

        // remove all queued actions
        rejectContext(this);

        // unmount all domain methods
        this.actions().forEach((actionName) => {
            this[actionName] = noop;
        });
    },
};

function appendToDomainInstance(ctx, appendices) {
    if (!appendices) {
        ctx.actions = () => [];
        return;
    }

    const actionNames = Object.keys(appendices).filter((appendixName) => {
        const appendix = appendices[appendixName];

        if (ctx[appendixName] !== undefined) {
            throw new Error(`${errorPrefix}${appendixName} is reserved for Domain interface`);
        }

        if (typeof appendix !== 'function') {
            ctx[appendixName] = appendix;
            return false;
        }

        ctx[appendixName] = (...args) => {
            dispatchDomainAction(appendix, ctx, args);
        };

        ctx[appendixName].originalLength = appendix.length || appendix.originalLength;
        return true;
    });

    ctx.actions = () => actionNames;
}
