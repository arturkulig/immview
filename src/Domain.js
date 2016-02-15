import I from 'immutable';

import Queue from './Queue.js';

export default class Domain {
    /**
     * Create a domain holding a view
     * @param {Reactor} view
     */
    constructor(view, actions) {
        this.view = view;
        this._actionNames = Object.keys(actions);

        this._actionNames.forEach((actionName) => {
            if (this[actionName]) {
                throw new Error('"' + actionName + '" is reserved for Domain interface');
            }

            this[actionName] = Queue.createAction(actions[actionName], this);
        });
    }

    get isDomain() {
        return true;
    }

    subscribe(reaction) {
        return this.view.subscribe(reaction);
    }

    destroy() {
        this.view.destroy();
        this.view = null;

        Queue.rejectContext(this);
    }
}
