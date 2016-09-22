//@flow
import Observable from './Observable';

const errorPrefix = 'Immview::Debounce: ';

export default function Debounce(source: Observable, timeout: number = 0) {
    Observable.call(this);

    if (!(source && source.subscribe)) {
        throw new Error(`${errorPrefix}incorrect source`);
    }

    this.timeoutID = null;
    this.digest(source.read());
    this.subscription = source.addSubscription(data => {
        if (this.timeoutID) {
            clearTimeout(this.timeoutID);
        }
        this.timeoutID = setTimeout(() => {
            this.timeoutID = null;
            this.consume(data);
        }, timeout);
    });
}

Debounce.prototype = Object.create(Observable.prototype);

Debounce.prototype.destroy = function () {
    if (this.timeoutID) {
        clearTimeout(this.timeoutID);
        this.timeoutID = null;
    }
    if (this.subscription) {
        this.subscription();
    }
    Observable.prototype.destroy.call(this);
};
