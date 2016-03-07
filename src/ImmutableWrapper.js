import Queue from './Queue';

/**
 * @deprecated
 * @description this module is meant for deprecation in next major
 */

/**
 * adds read methods to `that`
 * that enable reading from its structure
 *
 * @param  {Reactor} decorator subject
 * @return {void}
 */
function immutableReadWrapper(that) {
    [
        'equals',
        'hashCode',

        'get',
        'has',
        'includes',
        'first',
        'last',

        'getIn',
        'hasIn',

        'toJS',
        'toObject',
        'toArray',

        'toMap',
        'toOrderedMap',
        'toSet',
        'toOrderedSet',
        'toList',
        'toStack',
        'toSeq',
        'toKeyedSeq',
        'toIndexedSeq',
        'toSetSeq',

        'keys',
        'values',
        'entries',

        'keySeq',
        'valueSeq',
        'entrySeq',

        'map',
        'filter',
        'filterNot',
        'reverse',
        'sort',
        'sortBy',
        'groupBy',
        'forEach',

        'slice',
        'rest',
        'butLast',
        'skip',
        'skipLast',
        'skipWhile',
        'skipUntil',
        'take',
        'takeLast',
        'takeWhile',
        'takeUntil',

        'concat',
        'flatten',
        'flatMap',

        'reduce',
        'reduceRight',
        'every',
        'some',
        'join',
        'isEmpty',
        'count',
        'countBy',

        'find',
        'findLast',
        'findEntry',
        'findLastEntry',
        'max',
        'maxBy',
        'min',
        'minBy',

        'isSubset',
        'isSuperset',
    ].forEach(prop => {
        that[prop] = function (...args) {
            return that.structure[prop].apply(that.structure, args);
        };
    });
}

/**
 * adds write methods of Iterable interface to Reactor
 * so they can trigger Reactor digesting of new value
 *
 * @param  {Reactor} decorator subject
 * @return {void}
 */
function immutableWriteWrapper(that) {
    [
        'set',
        'delete',
        'update',
        'merge',
        'mergeDeep',
        'setIn',
        'deleteIn',
        'updateIn',
        'mergeIn',
        'mergeDeepIn',
        /* Set */
        'add',
        'clear',
        'union',
        'intersect',
        'substract',
    ].forEach(prop => {
        that[prop] = Queue.createAction(function (...args) {
            that.digest(that.structure[prop].apply(that.structure, args));
        });
    });
}

export {
    immutableWriteWrapper,
    immutableReadWrapper,
};
