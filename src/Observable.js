//@flow
import * as Digest from './Digest';
import * as DispatcherModule from './Dispatcher';
import {immutabilize, isImmutabilized} from './Immutabilize';
import env from './env';
const fortify = env === 'production'
    ? identity
    : immutabilize;

/*
 * Observable is an base class for all immview observables
 */
export default function Observable() {
    this.structure = null;
    this.priority = Observable.nextPriority++;
    this.subscriptions = [
        data => {
            this.structure = data;
        },
    ];
    this.closed = false;
}

Observable.nextPriority = 0;

Observable.prototype = {
    structure: null,
    priority: 0,
    subscriptions: [],
    closed: false,

    read(): mixed {
        return this.structure;
    },

    shouldObservableUpdate(candidate: mixed): boolean {
        return hasValue(candidate) && this.read() != candidate;
    },

    /*
     * Defers a digestion with a function
     * that can be replaced
     * without any data loss
     */
    consume(candidate: mixed, process: (subject: any) => any = identity) {
        Digest.queue(this, candidate, process);
    },

    /*
     * Replace current state and push data further
     */
    digest(candidate: any) {
        if (this.digestCandidate || candidate instanceof Promise) {
            this.digestCandidate =
                (this.digestCandidate || Promise.resolve())
                    .then(() => candidate)
                    .then(data => this.flush(data));
        } else {
            this.flush(candidate);
        }
    },

    flush(candidate: any) {
        if (this.shouldObservableUpdate(candidate)) {
            for (let i = 0; this.subscriptions && i < this.subscriptions.length; i++) {
                this.subscriptions[i](fortify(candidate));
            }
        }
    },

    /*
     * Registers a function that is going to be fed with new data pushing by this observable
     */
    addSubscription(reaction: (structure: any) => any) {
        if (this.subscriptions.indexOf(reaction) < 0) {
            this.subscriptions.push(reaction);
        }
        return () => {
            this.subscriptions = this.subscriptions.filter(
                registeredReaction => registeredReaction !== reaction
            );
        };
    },

    /*
     * Registers a function that is going to be fed with new data pushing by this observable.
     * Will launch provided function immediately.
     */
    subscribe(reaction) {
        reaction(this.read());
        return this.addSubscription(reaction);
    },

    destroy() {
        DispatcherModule.rejectContext(this);
        this.structure = null;
        this.subscriptions = [];
        Object.defineProperty
            ? Object.defineProperty(this, 'closed', { value: true, writable: false })
            : this.closed = true;
    },

    map(processor) {
        const View = require('./View').default;
        return new View(this, processor);
    },

    debounce(timeout) {
        const Debounce = require('./Debounce').default;
        return new Debounce(this, timeout);
    },

    throttle(timeout) {
        const Throttle = require('./Throttle').default;
        return new Throttle(this, timeout);
    },

    scan(valuesToRemember, initialValue) {
        const Scan = require('./Scan').default;
        return new Scan(this, valuesToRemember, initialValue);
    },

    reduce(reducer) {
        const Reduce = require('./Reduce').default;
        return new Reduce(this, reducer);
    },

    info(name = '') {
        try {
            const content = JSON.stringify(this.read()).substr(0, 32);
            DispatcherModule
                .Dispatcher
                .logger
                .log(`#${this.priority} ${name} ${content}`);
        } catch (e) {
            DispatcherModule
                .Dispatcher
                .logger
                .log(`#${this.priority} ${name}`, this.read());
        }
    },
};

function hasValue(v) {
    return (
        v !== undefined &&
        v !== null
    );
}

function identity(v) {
    return v;
}
