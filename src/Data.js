import {
    fromJS,
} from 'immutable';

import { dispatchDataWrite } from './Dispatcher';
import Reactor from './Reactor.js';

export default function Data(initialData) {
    Reactor.call(this);

    this.linkTo(null);
    this.digest(fromJS(initialData));
}

Data.prototype = {
    ...Reactor.prototype,
    /**
     * Dispatch a change instruction to the Data
     * @param {Iterable|function(data: Iterable):Iterable} change
     */
    write(change) {
        dispatchDataWrite(() => {
            if (typeof change === 'function') {
                this.digest(change(this.read()));
            } else {
                this.digest(change);
            }
        });
    },
};
