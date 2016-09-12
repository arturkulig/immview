//@flow
import Observable from './Observable.js';

const errorPrefix = 'Immview::Merge: ';

export default function Merge(sources: { [id: string]: Observable }) {
    Observable.call(this);

    if (!sources || typeof sources !== 'object') {
        throw new Error(`${errorPrefix}No sources to plug in`);
    }

    const sourcesNames = Object.keys(sources);

    // prefill mergedStructure before launching subscriptions
    let mergedStructure = sourcesNames.reduce(
        (structure, sourceName) =>
            Object.assign(
                { [sourceName]: sources[sourceName].read() },
                structure
            ),
        {}
    );

    // subscribe to all data changes in parent views
    this.unsubs = sourcesNames.map(
        sourceName => sources[sourceName].addSubscription(
            data => {
                mergedStructure = Object.assign(
                    {},
                    mergedStructure,
                    { [sourceName]: data }
                );
                this.consume(mergedStructure);
            }
        )
    );

    this.digest(Object.assign({}, mergedStructure));
}

Merge.prototype = Object.assign(
    {},
    Observable.prototype,
    {
        destroy() {
            Observable.prototype.destroy.call(this);

            if (this.unsubs) {
                this.unsubs.forEach(func => func());
            }

            this.unsubs = null;
        },
    }
);
