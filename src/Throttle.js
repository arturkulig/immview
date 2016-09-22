//@flow
import Observable from './Observable';

const errorPrefix = 'Immview::Throttle: ';

export default function Throttle(source: Observable, timeout: number = 0) {
    Observable.call(this);

    if (!(source && source.subscribe)) {
        throw new Error(`${errorPrefix}incorrect source`);
    }

    this.timeoutID = null;
    this.timeoutedData = null;
    this.digest(source.read());
    this.subscription = source.addSubscription(data => {
        this.timeoutedData = data;
        if (!this.timeoutID) {
            this.timeoutID = setTimeout(() => {
                this.timeoutID = null;
                this.consume(this.timeoutedData);
            }, timeout);
        }
    });
}

Throttle.prototype = Object.create(Observable.prototype);

Throttle.prototype.destroy = function () {
    if (this.timeoutID) {
        clearTimeout(this.timeoutID);
        this.timeoutID = null;
    }
    if (this.subscription) {
        this.subscription();
    }
    Observable.prototype.destroy.call(this);
};
