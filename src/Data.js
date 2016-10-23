//@flow
import Observable from './Observable';

export default function Data(initialData: any) {
    Observable.call(this);
    this.digest(initialData);

    this.pendingChanges = [];
}

Data.prototype = Object.create(Observable.prototype);

Data.prototype.write = function (change) {
    if (this.closed) return;
    if (typeof change === 'function') {
        this.pendingChanges.push(change);
        this.consume(this, executePendingChanges);
    } else {
        this.consume(change);
    }
};
Data.prototype.destroy = function () {
    Observable.prototype.destroy.call(this);
    this.pendingChanges = null;
};

function executePendingChanges(observable: Data) {
    if (observable.closed) {
        return observable.read();
    }
    const changed = observable.pendingChanges.reduce(
        (result, change) => change(result),
        observable.read()
    );
    observable.pendingChanges = [];
    return changed;
}
