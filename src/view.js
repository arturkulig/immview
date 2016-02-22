import * as I from 'immutable';
import Reactor from './Reactor.js';

import { immutableReadWrapper } from './ImmutableWrapper.js';

export default class View extends Reactor {

    constructor(source, process) {
        super();

        if (process) {
            this.process = process;
        }

        immutableReadWrapper(this);

        if (source && typeof source === 'object') {
            if (source.isReactor || source.isDomain) {
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
        this.unsubs = null;
        this.structure = null;
        this.prestructure = null;
        this.reactors = null;
    }

}
