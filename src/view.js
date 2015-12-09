var I = require('Immutable');
var Reactor = require('./Reactor.js');

class View extends Reactor {

    constructor(masterView, process) {
        super();
        if (process) {
            this.process = process;
        }

        masterView.subscribe(this.digest.bind(this));
    }

    process(data) {
        return data;
    }

}

module.exports = View;
