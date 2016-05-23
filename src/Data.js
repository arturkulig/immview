import {
    Iterable,
    fromJS,
} from 'immutable';

import { dispatchDataPush } from './Dispatcher';
import Reactor from './Reactor.js';

export default function Data(initialData) {
    Reactor.call(this);

    this.linkTo(null);
    this.consume(fromJS(initialData));
}

Data.prototype = {
    ...Reactor.prototype,
    /**
     * Dispatch a change instruction to the Data
     * @param {Iterable|function(data: Iterable):Iterable} change
     */
    write(change) {
        if (typeof change === 'function') {
            this.consume(this.read(), change);
        } else {
            this.consume(change);
        }
    },
};
