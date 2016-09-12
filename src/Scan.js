//@flow
import Observable from './Observable';

export default function Scan(
    source: Observable,
    valuesToRemember: number = 2,
    initialValue: any = null
) {
    Observable.apply(this);

    let history = pushToHistory(
        premadeHistory(initialValue, valuesToRemember),
        valuesToRemember,
        source.read()
    );
    this.digest(history);

    this.unsubscribe = source.addSubscription(
        sourceData => {
            history = pushToHistory(history, valuesToRemember, sourceData);
            this.consume(history);
        }
    );
}

Scan.prototype = Object.assign(
    {},
    Observable.prototype,
    {
        read() {
            return [].concat(Observable.prototype.read.apply(this));
        },
        destroy() {
            Observable.prototype.destroy.apply(this);

            if (this.unsubscribe) {
                this.unsubscribe();
                this.unsubscribe = null;
            }
        },
    }
);

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
