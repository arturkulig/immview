var I = require('immutable');

class Reactor {
    constructor() {
        this.reactors = I.Set();
        this.structure = undefined; //yet declared
    }

    get isReactor() {
        return true;
    }

    subscribe(reaction) {
        this.reactors = this.reactors.add(reaction);
        return () => {
            this.reactors = this.reactors.delete(reaction);
        };
    }

    process() {
        throw new Error('abstract');
    }

    digest(data) {
        var newValue = this.process(data);
        if (newValue !== this.structure) {
            this.flush(this.structure = newValue);
        }
    }

    flush(data) {
        this.reactors.forEach(reactor => reactor(data));
    }

    destroy() {
        throw new Error('abstract');
    }
}

module.exports = Reactor;
