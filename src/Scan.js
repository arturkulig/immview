import Reactor from './Reactor.js';

export default function Scan(source, valuesToRemember = 2, initialValue = null) {
    Reactor.apply(this);

    let history = pushToHistory(
        premadeHistory(initialValue, valuesToRemember),
        valuesToRemember,
        source.read()
    );
    this._digest(history);

    this.unsubscribe = source.addSubscription(
        sourceData => {
            history = pushToHistory(history, valuesToRemember, sourceData);
            this._consume(history);
        }
    );
}

Scan.prototype = Object.create(Reactor.prototype);

Scan.prototype.read = function () {
    return [].concat(Reactor.prototype.read.apply(this));
};

Scan.prototype.destroy = function () {
    Reactor.prototype.destroy.apply(this);

    if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
    }
};

function premadeHistory(initialValue, valuesToRemember) {
    if (initialValue === null) {
        return [];
    }
    const steps = [];
    for (let i = 0; i < valuesToRemember; i++) {
        steps.push(initialValue);
    }
    return steps;
}

function pushToHistory(history, valuesToRemember, newValue) {
    const newHistory = history.slice(-1 * valuesToRemember + 1);
    newHistory.push(newValue);
    return newHistory;
}
