import * as I from 'immutable';

let _running = false;
let _line = I.OrderedSet();

let Queue = {

    createCommand(command, context) {
        return function queueAction(...args) {
            _line = _line.add({
                command,
                context,
                args,
            });
            Queue.run();
        };
    },

    run() {
        if (_running) {
            return;
        }

        _running = true;

        while (_line.count() > 0) {
            let toRun = _line.first();
            _line = _line.rest();

            try {
                let {
                    context,
                    command,
                    args,
                    } = toRun;
                command.apply(context, args);
            } catch (e) {
                console.error('Immview.Queue run - Error occured while running running a function');
                console.error(e.message);
            }

        }

        _running = false;
    },

};

export default Queue;
