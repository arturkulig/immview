//@flow
/*
Reason to have this class is to support existing code
that expects that product of merging different streams with View
is a Immutable.js Map therefore has at least basic interface of Immutable.js

Should not be officially documented removed in few next versions
 */

export default function ViewMergeMap(initialObject?: Object) {
    for (let prop in initialObject) {
        if (Object.prototype.hasOwnProperty.call(initialObject, prop)) {
            this[prop] = initialObject[prop];
        }
    }
}

ViewMergeMap.prototype = {
    clone() {
        return new ViewMergeMap(this);
    },

    /**
     * Sets a value on new instance and returns it
     * @param {string} prop
     * @param {*} value
     * @returns {ViewMergeMap}
     */
    set(prop, value) {
        const anotherInstance = new ViewMergeMap(this);
        anotherInstance[prop] = value;
        return anotherInstance;
    },

    /**
     * Returns stored value
     * @param {string} prop
     * @returns {*}
     */
    get(prop) {
        return this[prop];
    },

    /**
     * Creates new ViewMergeMap
     * @param processor
     * @param context
     * @returns {ViewMergeMap}
     */
    map(processor, context = this) {
        const result = new ViewMergeMap();
        for (let prop in this) {
            if (Object.prototype.hasOwnProperty.call(this, prop)) {
                result[prop] = processor.call(context, this[prop]);
            }
        }
        return result;
    },

    /**
     * @returns {ViewMergeMap}
     */
    toJS() {
        return this.map(v => {
            if (typeof v === 'object' && typeof v.toJS === 'function') {
                return v.toJS();
            }
            return v;
        });
    },

    /**
     * @returns {ViewMergeMap}
     */
    toObject() {
        return this;
    },

    /**
     * Gets a value stored deeply in Immutable.js structures placed inside ViewMergeMap instance
     * @param {Array.<string>} props
     * @param {*} defaultValue
     * @returns {*}
     */
    getIn([prop, ...otherProps] = [], defaultValue) {
        if (otherProps.length) {
            return this.get(prop).getIn(otherProps, defaultValue);
        }
        return (
            this.get(prop) === undefined
                ? defaultValue
                : this.get(prop)
        );
    },

    /**
     * Sets a value deeply in Immutable.js structures placed inside ViewMergeMap instance
     * @param {Array.<string>} props
     * @param newValue
     * @returns {*|ViewMergeMap}
     */
    setIn([prop, ...otherProps] = [], newValue) {
        if (otherProps.length) {
            return this.set(
                prop,
                (this.get(prop) || new ViewMergeMap()).setIn(otherProps, newValue)
            );
        }
        return this.set(prop, newValue);
    },
};
