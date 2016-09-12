//@flow
import * as Digest from './Digest';
import * as Dispatcher from './Dispatcher';
import immutabilize from './Immutabilize';
import env from './env';
const fortify = env === 'production'
    ? identity
    : immutabilize;

/*
 * Observable is an base class for all immview observables
 */
export default function Observable() {
    this._id = Observable.lastInstanceId++;
    this._subscriptions = [];
    this.closed = false;
}

Observable.lastInstanceId = 0;

Observable.prototype = {
    _id: 0,
    _subscriptions: [],
    closed: false,

    read() {
        return this.structure;
    },

    shouldObservableUpdate(candidate) {
        return hasValue(candidate) && this.read() != candidate;
    },

    /*
     * Defers a digestion with a function
     * that can be replaced
     * without any data loss
     */
    consume(data: any, process: (subject: any) => any = identity) {
        Digest.queue(this, data, process);
    },

    /*
     * Replace current state and push data further
     */
    digest(data: any) {
        if (this.shouldObservableUpdate(data)) {
            this.structure = fortify(data);
            this.flush();
        }
    },

    /*
     * Pushes data to all listeners
     */
    flush() {
        this._subscriptions.forEach(reaction => reaction(this.read()));
    },

    /*
     * Registers a function that is going to be fed with new data pushing by this observable
     */
    addSubscription(reaction: (structure: any) => any) {
        if (this._subscriptions.indexOf(reaction) < 0) {
            this._subscriptions.push(reaction);
        }
        return () => {
            this._subscriptions = this._subscriptions.filter(
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
        Dispatcher.rejectContext(this);
        this.structure = null;
        this._subscriptions = [];
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
