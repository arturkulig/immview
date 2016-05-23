import {
    Map,
} from 'immutable';
import Reactor from './Reactor.js';

const identity = data => data;

export default function View(source, process = identity) {
    Reactor.call(this);

    if (source && typeof source === 'object') {
        if (source.subscribe) {
            this.connectToSource(source, process);
        } else {
            this.connectToMultipleSources(source, process);
        }
    }
}

View.prototype = {
    ...Reactor.prototype,

    /**
     * @private
     * @param {Reactor} source
     */
    connectToSource(source, process) {
        this.linkTo(source);
        this.unsubs = [
            source.subscribe(data => this.consume(process(data))),
        ];
    },

    /**
     * @private
     * @param {Object.<Reactor>} sources
     */
    connectToMultipleSources(sources, process) {
        // initialize as a map{string:Iterable}
        let mergedStructure = Map();

        const sourcesNames = Object.keys(sources);

        // prefill mergedStructure before launching subscriptions
        sourcesNames.forEach(sourceName => {
            const source = sources[sourceName];
            this.linkTo(source);
            const sourceData = source.read();
            mergedStructure = mergedStructure.set(sourceName, sourceData);
        });

        // subscribe to all data changes in parent views
        this.unsubs = sourcesNames.map(
            sourceName => sources[sourceName].appendReactor(
                data => {
                    mergedStructure = mergedStructure.set(sourceName, data);
                    this.consume(mergedStructure, process);
                }
            )
        );

        this.consume(mergedStructure, process);
    },

    destroy() {
        Reactor.prototype.destroy.call(this);

        if (this.unsubs) {
            this.unsubs.forEach(func => func());
        }

        this.unsubs = null;
    },
};
