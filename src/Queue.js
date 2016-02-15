import * as I from 'immutable';

let _running = false;
let _line = I.OrderedSet();

let Queue = {

    createAction(action, context) {
        return (...args) => {
            Queue.append(action, context, args);
            Queue.run();
        };
    },

    append(action, context, args) {
        _line = _line.add({
            action,
            context,
            args,
        });
    },

    shift() {
        let toRun = _line.first();
        _line = _line.rest();
        return toRun;
    },

    rejectContext(context) {
        _line = _line.filter(item => item.context !== context);
    },

    run() {
        if (_running) {
            return;
        }

        _running = true;

        while (_line.count() > 0) {
            try {
                Queue.runFirst();
            } catch (e) {
                console.error('Immview.Queue run - Error occured while running running a function');
                console.error(e.message);
            }
        }

        _running = false;
    },

    runFirst() {
        let toRun = Queue.shift();
        let {
            context,
            action,
            args,
            } = toRun;
        action.apply(context, args);
    },

};

export default Queue;
