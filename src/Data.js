var I = require('Immutable');
var Reactor = require('./Reactor.js');
var View = require('./View.js');

class Data extends Reactor {

    constructor(initialData) {
        super();
        this.structure = I.fromJS(initialData);

        /* readers */

        [
            'get',
            'has',
            'getIn',
            'hasIn',
            'includes',
            'first',
            'last',
        ].forEach(prop => {
            this[prop] = this[prop] || (function() {
                return this.structure[prop].apply(this.structure, arguments);
            });
        });

        /* modificators */
        [
            'set',
            'delete',
            'update',
            'merge',
            'mergeDeep',
            'setIn',
            'deleteIn',
            'updateIn',
            'mergeIn',
            'mergeDeepIn',
        ].forEach(prop => {
            if (typeof this.structure[prop] === 'function') {
                this[prop] = this[prop] || (function() {
                    markDataDirty(this);
                    return (this.structure = this.structure[prop].apply(this.structure, arguments));
                }.bind(this));
            }
        });

        markDataDirty(this);
    }

    get isData() {
        return true;
    }

    process() {
        return this.structure;
    }

}

var dirtyDataReevalTimer = 0;
var dirtyDatas = I.Set();

function markDataDirty(view) {
    // add Data to the set
    dirtyDatas = dirtyDatas.add(view);

    // and if there isn't already
    if (!dirtyDataReevalTimer) {
        // set a new task of digesting changes
        dirtyDataReevalTimer = setTimeout(
            () => {
                // clear the timer, so views can be marked dirty immediately
                dirtyDataReevalTimer = 0;

                // execute digest for all dirty views
                dirtyDatas.forEach(
                    view => view.digest()
                );
            },

            0
        );
    }
}

module.exports = Data;
