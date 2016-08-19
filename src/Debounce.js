import Reactor from './Reactor.js';

const errorPrefix = 'Immview::Debounce: ';

export default function Debounce(source, timeout = 0) {
    Reactor.call(this);

    if (!(source && source.subscribe)) {
        throw new Error(`${errorPrefix}incorrect source`);
    }

    this.timeoutID = null;
    this._digest(source.read());
    this.subscription = source.addSubscription(data => {
        if (this.timeoutID) {
            clearTimeout(this.timeoutID);
        }
        this.timeoutID = setTimeout(() => {
            this.timeoutID = null;
            this._consume(data);
        }, timeout);
    });
}

Debounce.prototype = Object.create(Reactor.prototype);

Debounce.prototype.destroy = function () {
    if (this.timeoutID) {
        clearTimeout(this.timeoutID);
        this.timeoutID = null;
    }
    if (this.subscription) {
        this.subscription();
    }
    Reactor.prototype.destroy.call(this);
};
