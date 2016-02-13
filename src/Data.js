var I = require('immutable');

var Reactor = require('./Reactor.js');

var {
    immutableWriteWrapper,
    immutableReadWrapper,
    } = require('./ImmutableWrapper.js');

class Data extends Reactor {

    constructor(initialData) {
        super();
        this.digest(I.fromJS(initialData));
        immutableReadWrapper(this);
        immutableWriteWrapper(this);
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

module.exports = Data;
