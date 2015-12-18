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

        this.connectToView(masterView);
    }

    /**
     * @private
     * @param {Reactor} masterView
     */
    connectToView(masterView) {
        this._subscriptionCancelations = [masterView.subscribe(this.digest.bind(this))];
        this.digest(masterView.structure);
    }

    get isView() {
        return true;
    }

    /**
     * @private
     * @param {*} data
     * @returns {*}
     */
    process(data) {
        return data;
    }

    destroy() {
        this._subscriptionCancelations.forEach(func => func());
    }

}

module.exports = View;
