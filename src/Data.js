import * as I from 'immutable';

import Queue from './Queue';
import Reactor from './Reactor.js';

var {
    immutableWriteWrapper,
    immutableReadWrapper,
    } = require('./ImmutableWrapper.js');

export default class Data extends Reactor {

    constructor(initialData) {
        super();

        immutableReadWrapper(this);
        immutableWriteWrapper(this);

        if (I.Iterable.isIterable(initialData)) {
            this.digest(initialData);
        } else {
            this.digest(I.fromJS(initialData));
        }
    }

    get isData() {
        return true;
    }

    process(data) {
        return data;
    }

    destroy() {
        this.structure = null;
        this.reactors = null;
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

}
