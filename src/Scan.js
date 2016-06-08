import {
    List,
} from 'immutable';

import Reactor from './Reactor.js';

export default function Scan(source, initialValue = null, stepsToRemember = 2) {
    Reactor.apply(this);

    this.linkTo(source);

    let history = pushToHistory(
        premadeHistory(initialValue, stepsToRemember),
        stepsToRemember,
        source.read()
    );
    this.digest(history);

    this.unsubscribe = source.appendReactor(
        sourceData => {
            history = pushToHistory(history, stepsToRemember, sourceData);
            this.consume(history);
        }
    );
}

Scan.prototype = {
    ...Reactor.prototype,

    destroy() {
        Reactor.prototype.destroy.apply(this);

        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    },
};

function premadeHistory(initialValue, stepsToRemember) {
    if (initialValue === null) {
        return List();
    }
    const steps = [];
    for (let i = 0; i < stepsToRemember; i++) {
        steps.push(initialValue);
    }
    return List(steps);
}

function pushToHistory(history, stepsToRemember, newValue) {
    return history.asMutable().takeLast(stepsToRemember - 1).push(newValue).asImmutable();
}
