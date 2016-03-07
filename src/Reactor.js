import * as I from 'immutable';

function hasValue(v) {
    return (
        v !== undefined &&
        v !== null
    );
}

export default class Reactor {
    constructor() {
        this.reactors = I.Set();
        this.structure = undefined; //yet declared
    }

    get isReactor() {
        return true;
    }

    subscribe(reaction) {
        this.reactors = this.reactors.add(reaction);
        reaction(this.structure);
        return () => {
            this.reactors = this.reactors.delete(reaction);
        };
    }

    process() {
        throw new Error('abstract');
    }

    digest(data) {
        var newValue = this.process(data);
        if (
            hasValue(newValue) && (
                !hasValue(this.structure) ||
                I.is(newValue, this.structure) === false
            )
        ) {
            this.structure = newValue;
            this.flush();
        }
    }

    flush() {
        this.reactors.forEach(reactor => reactor(this.structure));
    }

    destroy() {
        throw new Error('abstract');
    }
}
