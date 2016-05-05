import {
    Iterable,
    fromJS,
} from 'immutable';

import Dispatcher from './Dispatcher';
import Reactor from './Reactor.js';

export default function Data(initialData) {
    Reactor.call(this);

    // TODO drop else branch
    if (Iterable.isIterable(initialData)) {
        this.digest(initialData);
    } else {
        this.digest(fromJS(initialData));
    }
}

Data.prototype = {
    ...Reactor.prototype,
    /**
     * Dispatch a change instruction to the Data
     * @param {Iterable|function(data: Iterable):Iterable} change
     */
    write(change) {
        if (typeof change === 'function') {
            Dispatcher.runInQueue(
                2,
                () => this.digest(change(this.read())),
                this
            );
        } else {
            Dispatcher.runInQueue(2, this.digest, this, [change]);
        }
    },
};
