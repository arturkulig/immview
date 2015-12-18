var I = require('Immutable');
var Reactor = require('./Reactor.js');

var { immutableReadWrapper } = require('./ImmutableWrapper.js');

class View extends Reactor {

    constructor(source, process) {
        super();

        if (process) {
            this.process = process;
        }

        immutableReadWrapper(this);

        if (source && typeof source === 'object') {
            if (source.isReactor) {
                this.connectToView(source);
            } else {
                this.connectToViews(source);
            }
        }
    }

    /**
     * @private
     * @param {Reactor} masterView
     */
    connectToView(masterView) {
        this.unsubs = [masterView.subscribe(this.digest.bind(this))];
        this.digest(masterView.structure);
    }

    /**
     * @private
     * @param {Object.<Reactor>} views
     */
    connectToViews(views) {
        this.prestructure = I.Map();
        this.unsubs = Object.keys(views).map(viewName => {
            var sub = data => {
                this.digest(
                    this.prestructure = this.prestructure.set(viewName, data)
                );
            };

            sub(views[viewName].structure);

            return views[viewName].subscribe(sub);
        });
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
        this.unsubs.forEach(func => func());
    }

}

module.exports = View;
