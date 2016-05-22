import Reactor from './Reactor.js';

const errorPrefix = 'Immview::Throttle: ';

export default function Throttle(source, timeout = 0) {
    Reactor.call(this);

    if (!(source && source.subscribe)) {
        throw new Error(`${errorPrefix}incorrect source`);
    }

    this.timeoutID = null;
    this.timeoutedData = null;
    this.digest(source.read());
    this.subscription = source.appendReactor(data => {
        this.timeoutedData = data;
        if (!this.timeoutID) {
            this.timeoutID = setTimeout(() => {
                this.timeoutID = null;
                this.digest(this.timeoutedData);
            }, timeout);
        }
    });
}

Throttle.prototype = {
    ...Reactor.prototype,

    destroy() {
        if (this.timeoutID) {
            clearTimeout(this.timeoutID);
            this.timeoutID = null;
        }
        if (this.subscription) {
            this.subscription();
        }
        Reactor.prototype.destroy.call(this);
    },
};
