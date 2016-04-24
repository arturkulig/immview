import {
    Iterable,
    fromJS,
} from 'immutable';

import Queue from './Queue';
import View from './View.js';
import Reactor from './Reactor.js';

export default class Data extends Reactor {

    constructor(initialData) {
        super();

        if (Iterable.isIterable(initialData)) {
            this.digest(initialData);
        } else {
            this.digest(fromJS(initialData));
        }
    }

    get isData() {
        return true;
    }

    /**
     * Dispatch a change instruction to the Data
     * @param {Iterable|function(data: Iterable):Iterable} change
     */
    write(change) {
        if (typeof change === 'function') {
            Queue.runInQueue(
                () => this.digest(change(this.read())),
                this
            );
        } else {
            Queue.runInQueue(this.digest, this, [change]);
        }
    }

    /**
     * Creates a View by digesting the stream
     * @param {Function} nextProcessor
     */
    map(nextProcessor) {
        return new View(this, nextProcessor);
    }

}
