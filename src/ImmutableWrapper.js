/**
 * adds read methods to `that`
 * that enable reading from its structure
 *
 * @param  {Reactor} decorator subject
 * @return {void}
 */
function immutableReadWrapper(that) {
    [
        'get',
        'has',
        'getIn',
        'hasIn',
        'includes',
        'first',
        'last',
        'toJS',
    ].forEach(prop => {
        that[prop] = that[prop] || (function() {
            return that.structure[prop].apply(that.structure, arguments);
        });
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
  ].forEach(prop => {
      that[prop] = that[prop] || (function() {
          return that.digest(that.structure[prop].apply(that.structure, arguments));
      }.bind(that));
  });
}

module.exports = {
    immutableWriteWrapper,
    immutableReadWrapper,
};
