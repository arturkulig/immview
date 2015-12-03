var I = require("Immutable");
var View = require('./View.js');

class MasterView extends View {

    constructor(input) {
        super();
        this.structure = I.fromJS(input);

        [
            "set",
            "delete",
            "update",
            "merge",
            "mergeDeep",
            "setIn",
            "deleteIn",
            "updateIn",
            "mergeIn",
            "mergeDeepIn",
        ].forEach(prop => {
            if (typeof this.structure[prop] === 'function') {
                this[prop] = this[prop] || (function () {
                        markViewAsDirty(this);
                        this.structure = this.structure[prop].apply(this.structure, arguments);
                        return this.structure;
                    }.bind(this));
            }
        });
    }

    process() {
        return this.structure;
    }

}

var dirtyViewReevalTimer = 0;
var dirtyViews = I.Set();

function markViewAsDirty(view) {
    // add View to the set
    dirtyViews = dirtyViews.push(view);
    // and if there isn't already
    if (!dirtyViewReevalTimer) {
        // set a new task of digesting changes
        dirtyViewReevalTimer = setTimeout(
            () => {
                // clear the timer, so views can be marked dirty immediately
                dirtyViewReevalTimer = 0;
                // execute digest for all dirty views
                dirtyViews.forEach(
                    view => view.digest()
                );
            },
            0
        );
    }
}
