import {
    List,
} from 'immutable';

import Reactor from './Reactor.js';

export default function Scan(source, valuesToRemember = 2, initialValue = null) {
    Reactor.apply(this);

    this._linkTo(source);

    let history = pushToHistory(
        premadeHistory(initialValue, valuesToRemember),
        valuesToRemember,
        source.read()
    );
    this._digest(history);

    this.unsubscribe = source.appendReactor(
        sourceData => {
            history = pushToHistory(history, valuesToRemember, sourceData);
            this._consume(history);
        }
    );
}

Scan.prototype = Object.create(Reactor.prototype);

Scan.prototype.destroy = function () {
    Reactor.prototype.destroy.apply(this);

    if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
    }
};

function premadeHistory(initialValue, valuesToRemember) {
    if (initialValue === null) {
        return List();
    }
    const steps = [];
    for (let i = 0; i < valuesToRemember; i++) {
        steps.push(initialValue);
    }
    return List(steps);
}

function pushToHistory(history, valuesToRemember, newValue) {
    return history
        .asMutable()
        .takeLast(valuesToRemember - 1)
        .push(newValue)
        .asImmutable();
}
