//@flow
import ViewMergeMap from './ViewMergeMap';
import Observable from './Observable';
import env from './env';

const errorPrefix = 'Immview::View: ';

export default function View(
    source: Observable,
    process: (subject: any) => any = identity
) {
    Observable.call(this);

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

View.prototype = {
    ...Observable.prototype,
    destroy() {
        Observable.prototype.destroy.call(this);

        if (this.unsubs) {
            this.unsubs.forEach(func => func());
        }

        this.unsubs = null;
    },
};

function identity(data) {
    return data;
}

function connectToSource(aView, source, process) {
    aView.digest(process(source.read()));
    return [
        source.addSubscription(data => aView.consume(data, process)),
    ];
}

function connectToMultipleSources(aView, sources, process) {
    if (env !== 'production') {
        console.warn([
            errorPrefix,
            'View usage for merging streams is deprecated since 1.7.',
            'Consider changing to Merge type of node.',
        ].join(' '));
    }

    // initialize as a map{string:Iterable}
    let mergedStructure = new ViewMergeMap();

    const sourcesNames = Object.keys(sources);

    // prefill mergedStructure before launching subscriptions
    sourcesNames.forEach(sourceName => {
        const source = sources[sourceName];
        const sourceData = source.read();
        mergedStructure = mergedStructure.set(sourceName, sourceData);
    });

    // subscribe to all data changes in parent views
    const unsubs = sourcesNames.map(
        sourceName => sources[sourceName].addSubscription(
            data => {
                mergedStructure = mergedStructure.set(sourceName, data);
                aView.consume(mergedStructure.clone(), process);
            }
        )
    );

    aView.digest(process(mergedStructure.clone()));

    return unsubs;
}
