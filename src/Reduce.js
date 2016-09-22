import Observable from './Observable';
import env from './env';

const errorPrefix = 'Immview::Reduce';

function Reduce(source, reducer) {
    if (env !== 'production') {
        if (!source) {
            throw new Error(`${errorPrefix} #${this.priority}: No source`);
        }
        if (!source.subscribe) {
            throw new Error(`${errorPrefix} #${this.priority}: Source is not an observable`);
        }
        if (!reducer) {
            throw new Error(`${errorPrefix} #${this.priority}: No reducer provided`);
        }
    }

    Observable.call(this);

    this.unsubscribeFromSource = source.subscribe(
        sourceState => {
            this.consume(reducer(this.read(), sourceState));
        }
    );
}

Reduce.prototype = Object.create(Observable.prototype);

Reduce.prototype.destroy = function () {
    if (!this.closed) {
        this.unsubscribeFromSource();
        Observable.prototype.destroy.call(this);
    }
};

export default Reduce;
