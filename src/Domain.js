import Queue from './Queue.js';

const noop = () => {
};

export default class Domain {
    /**
     * Create a domain holding a view
     * @param {Reactor} view
     */
    constructor(view, actions) {
        /**
         * @private
         * @type {View} */
        this.view = null;
        /**
         * @private
         * @type {Data} */
        this.data = null;
        /**
         * @private
         * @type {String[]} */
        this._actionNames = null;

        this._claimView(view);
        this._claimActions(actions);
    }

    _claimView(view) {
        if (view.isReactor) {
            this.view = view;

            if (view.isData) {
                this.data = view;
            }
        } else {
            throw new Error('view is not inheriting Reactor type');
        }
    }

    _claimActions(actions) {
        this._actionNames = actions ? Object.keys(actions) : [];

        this._actionNames.forEach((actionName) => {
            if (this[actionName]) {
                throw new Error('"' + actionName + '" is reserved for Domain interface');
            }

            this[actionName] = Queue.createAction(actions[actionName], this);
        });
    }

    get structure() {
        return this.view && this.view.structure;
    }

    read() {
        return this.view.read();
    }
    
    map(nextProcessor) {
        return this.view.map(nextProcessor);
    }

    // no write method now and in the future
    // as it would encourage developers
    // to modify domain data
    // outside of the domain scope

    get isDomain() {
        return true;
    }

    subscribe(reaction) {
        return this.view.subscribe(reaction);
    }

    destroy() {
        // destroy and unmount a structure
        this.view.destroy();
        this.view = null;
        this.data = null;

        // remove all queued actions
        Queue.rejectContext(this);

        // unmount all domain methods
        this._actionNames.forEach((actionName) => {
            this[actionName] = noop;
        });
        this._actionNames = null;
    }
}
