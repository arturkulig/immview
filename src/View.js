import {
    Map,
} from 'immutable';
import Reactor from './Reactor.js';

const bypass = data => data;

export default class View extends Reactor {

    constructor(source, process = bypass) {
        super();

        if (source && typeof source === 'object') {
            if (source.subscribe) {
                this.connectToView(source, process);
            } else {
                this.connectToViews(source, process);
            }
        }
    }

    /**
     * @private
     * @param {Reactor} view
     */
    connectToView(view, process) {
        this.unsubs = [
            view.subscribe(data => this.digest(process(data))),
        ];
    }

    /**
     * @private
     * @param {Object.<Reactor>} views
     */
    connectToViews(views, process) {
        // initialize as a map{string:Iterable}
        let mergedStructure = Map();

        const viewsNames = Object.keys(views);

        // prefill mergedStructure before launching subscriptions
        viewsNames.forEach(viewName => {
            const viewData = views[viewName].read();
            if (viewData) {
                mergedStructure = mergedStructure.set(viewName, viewData);
            }
        });

        const digestMerged = () => this.digest(process(mergedStructure));

        // subscribe to all data changes in parent views
        this.unsubs = viewsNames.map(
            viewName => views[viewName].appendReactor(
                data => {
                    mergedStructure = mergedStructure.set(viewName, data);
                    digestMerged();
                }
            )
        );

        digestMerged();
    }

    destroy() {
        Reactor.prototype.destroy.call(this);

        if (this.unsubs) {
            this.unsubs.forEach(func => func());
        }

        this.unsubs = null;
    }

}
