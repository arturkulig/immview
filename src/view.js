var I = require('Immutable');
var Reactor = require('./Reactor.js');

var { immutableReadWrapper } = require('./ImmutableWrapper.js');

class View extends Reactor {

    constructor(masterView, process) {
        super();

        if (process) {
            this.process = process;
        }

        immutableReadWrapper(this);

        masterView.subscribe(this.digest.bind(this));

        this.digest(masterView.getIn([]));
    }

    get isView() {
        return true;
    }

    process(data) {
        return data;
    }

}

module.exports = View;
