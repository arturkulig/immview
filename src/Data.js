import { dispatchDataWrite } from './Dispatcher';
import Reactor from './Reactor.js';

export default function Data(initialData) {
    Reactor.call(this);

    this._linkTo(null);
    this._digest(initialData);
}

Data.prototype = Object.create(Reactor.prototype);

/**
 * Dispatch a change instruction to the Data
 * @param {Iterable|function(data: Iterable):Iterable} change
 */
Data.prototype.write = function (change) {
    dispatchDataWrite(() => {
        if (typeof change === 'function') {
            this._digest(change(this.read()));
        } else {
            this._digest(change);
        }
    });
};
