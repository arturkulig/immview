//@flow
import { dispatchDataWrite } from './Dispatcher';
import Reactor from './Observable';

export default function Data(initialData: any) {
    Reactor.call(this);

    this.digest(initialData);
}

Data.prototype = Object.create(Reactor.prototype);

/**
 * Dispatch a change instruction to the Data
 * @param {Iterable|function(data: Iterable):Iterable} change
 */
Data.prototype.write = function (change) {
    dispatchDataWrite(() => {
        if (this.closed) {
            return;
        }
        if (typeof change === 'function') {
            this.digest(change(this.read()));
        } else {
            this.digest(change);
        }
    }, this);
};
