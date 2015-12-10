var I = require('Immutable');

var dirtyDataReevalTimer = 0;
var dirtyDatas = I.Set();

function mark(view) {
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

module.exports = {
    mark,
};
