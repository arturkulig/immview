import {
    Map,
} from 'immutable';
import Reactor from './Reactor.js';

const errorPrefix = 'Immview::View: ';

export default function View(source, process = identity) {
    Reactor.call(this);

    if (source && typeof source === 'object') {
        if (source.subscribe) {
            this.unsubs = connectToSource(this, source, process);
        } else {
            this.unsubs = connectToMultipleSources(this, source, process);
        }
        return;
    }
    throw new Error(`${errorPrefix}No sources to plug in`);
}

View.prototype = Object.create(Reactor.prototype);

View.prototype.destroy = function destroyView() {
    Reactor.prototype.destroy.call(this);

    if (this.unsubs) {
        this.unsubs.forEach(func => func());
    }

    this.unsubs = null;
};

function identity(data) {
    return data;
}

function connectToSource(aView, source, process) {
    aView._linkTo(source);
    aView._digest(process(source.read()));
    return [
        source.appendReactor(data => aView._consume(data, process)),
    ];
}

function connectToMultipleSources(aView, sources, process) {
    // initialize as a map{string:Iterable}
    let mergedStructure = Map();

    const sourcesNames = Object.keys(sources);

    // prefill mergedStructure before launching subscriptions
    sourcesNames.forEach(sourceName => {
        const source = sources[sourceName];
        aView._linkTo(source);
        const sourceData = source.read();
        mergedStructure = mergedStructure.set(sourceName, sourceData);
    });

    // subscribe to all data changes in parent views
    const unsubs = sourcesNames.map(
        sourceName => sources[sourceName].appendReactor(
            data => {
                mergedStructure = mergedStructure.set(sourceName, data);
                aView._consume(mergedStructure, process);
            }
        )
    );

    aView._digest(process(mergedStructure));

    return unsubs;
}
