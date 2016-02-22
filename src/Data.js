import * as I from 'immutable';

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

        this.digest(I.fromJS(initialData));
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

}
