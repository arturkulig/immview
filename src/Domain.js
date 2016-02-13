import I from 'immutable';

import Queue from './Queue.js';

export default class Domain {
    /**
     * Create a domain holding a view
     * @param {Reactor} view
     */
    constructor(view, actions) {
        this._view = view;
        var commands = Object.keys(actions);
        commands.forEach(command => {
            if (this[command]) {
                throw new Error('"' + command + '" is reserved for Domain interface');
            }

            this[command] = Queue.createCommand(command, this);
        });
    }

    get isDomain() {
        return true;
    }

    subscribe(reaction) {
        return this._view.subscribe(reaction);
    }

    destroy() {
        return this._view.destroy();
    }
}
