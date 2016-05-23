import Reactor from './Reactor.js';

const errorPrefix = 'Immview::Debounce: ';

export default function Debounce(source, timeout = 0) {
    Reactor.call(this);

    if (!(source && source.subscribe)) {
        throw new Error(`${errorPrefix}incorrect source`);
    }

    this.linkTo(source);

    this.timeoutID = null;
    this.consume(source.read());
    this.subscription = source.appendReactor(data => {
        if (this.timeoutID) {
            clearTimeout(this.timeoutID);
        }
        this.timeoutID = setTimeout(() => {
            this.timeoutID = null;
            this.consume(data);
        }, timeout);
    });
}

Debounce.prototype = {
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
