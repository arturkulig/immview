//@flow
import Observable from './Observable';

export default function Data(initialData: any) {
    Observable.call(this);
    this.digest(initialData);

    this.pendingChanges = [];
}

Data.prototype = {
    ...Observable.prototype,
    write(change) {
        if (this.closed) return;
        if (typeof change === 'function') {
            this.pendingChanges.push(change);
            this.consume(this, executePendingChanges);
        } else {
            this.consume(change);
        }
    },
    destroy() {
        Observable.prototype.destroy.call(this);
        this.pendingChanges = null;
    },
};

function executePendingChanges(observable: Data) {
    const changed = observable.pendingChanges.reduce(
        (result, change) => change(result),
        observable.read()
    );
    observable.pendingChanges = [];
    return changed;
}
