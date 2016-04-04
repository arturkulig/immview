import * as I from 'immutable';

import Queue from './Queue';
import View from './View.js';
import Reactor from './Reactor.js';

export default class Data extends Reactor {

    constructor(initialData) {
        super();

        if (I.Iterable.isIterable(initialData)) {
            this.digest(initialData);
        } else {
            this.digest(I.fromJS(initialData));
        }
    }

    get isData() {
        return true;
    }

    write(change) {
        if (typeof change === 'function') {
            Queue.appendAndRunQueue(function updateStructure() {
                this.digest(change.apply(this, [this.read()]));
            }, this, [change]);
        } else {
            Queue.appendAndRunQueue(this.digest, this, [change]);
        }
    }

    map(nextProcessor) {
        return new View(this, nextProcessor);
    }

}
