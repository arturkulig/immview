import * as I from 'immutable';

let _running = false;
let _line = I.OrderedSet();

export default class Queue {

    static createCommand(command, domain) {
        return function queueAction(...args) {
            _line = _line.add({
                command,
                domain,
                args,
            });
            Queue.run();
        };
    }

    static run() {
        if (_running) {
            return;
        }

        _running = true;

        while (_line.count() > 0) {
            var toRun = _line.first();
            _line = _line.rest();

            try {
                var {
                    domain,
                    command,
                    args,
                    } = toRun;
                domain[command].apply(domain, args);
            } catch (e) {
                console.error('Immview.Queue run - Error occured while running running a function');
                console.error(e);
            }

        }

        _running = false;
    }
}
