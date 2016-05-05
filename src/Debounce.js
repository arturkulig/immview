import Reactor from './Reactor.js';

const errorPrefix = 'Immview::Debounce: ';

export default class Debounce extends Reactor {
    constructor(source, timeout = 0) {
        super();

        if (!(source && source.subscribe)) {
            throw new Error(`${errorPrefix}incorrect source`);
        }

        this.timeoutID = null;
        this.digest(source.read());
        this.subscription = source.appendReactor(data => {
            if (this.timeoutID) {
                window.clearTimeout(this.timeoutID);
            }
            this.timeoutID = window.setTimeout(() => {
                this.timeoutID = null;
                this.digest(data);
            }, timeout);
        });
    }

    destroy() {
        if (this.timeoutID) {
            window.clearTimeout(this.timeoutID);
            this.timeoutID = null;
        }
        if (this.subscription) {
            this.subscription();
        }
        Reactor.prototype.destroy.call(this);
    }
}
