#Changelog

## 1.7

- feat: Merging multiple source can and should be done with `Merge` and this functionality in `View` is now deprecated.
- feat: Immview no longer depends on `Immutable.js`
- feat: All objects that are provided within `View` processor and all subscriptions are now frozen. Functionality requires `Proxy`, but library doesn't rely on that as in many environments it is not present. It is cheaper than cloning, yet secures immutability of data provided to processing functions too.
- feat: `Observable` class got `shouldObservableUpdate` method responsible for decision if candidate value should replace old one and thus trigger subscriptions. Method can be overriden in subclass.
- feat: Any `Observable` can pass a `Promise` and it will result in asynchronous subscriptions triggering with `Promise` result. `Promise` rejection is not being handled. This, ofcourse, will work with `async`/`await` or `Promise`-returning processing functions in `View`.

## 1.6.2

- fix: Simpler and faster solution for eliminating unnecessary rerenders of merging views

## 1.6.1

- fix: `Data` ignores write instructions raised after the node being destroyed

## 1.6

- feat: `Scan` and `*.scan` added
- feat: Actions mounted on domain have additional property originalLength to indicate arguments amount of original action function
- On the road to have Immutable.js as option:
    - fix: `Data` no longer *magically* transforms initial data provided in constructor to Immutable.js data structure
    - fix: `View` is merging different streams using plain objects instead of Immutable.js map

## 1.5.2
 
- fix: writing during single tick, to the same Data twice or more, causing to reject all but last change

## 1.5.1

- fix: support for deferring ticker replacements

## 1.5

- feat: `Data` writes are prioritized over Domain actions
- feat: streams are sorted so nodes are waiting with their updates for their dependencies are resolved
- feat: `Debounce` and `*.debounce()` added
- feat: `Throttle` and `*.throttle()` added
- feat: `Dispatcher` is exposed now
- feat: `dispatch` function is directly exposed by package for convenience
- feat: guaranteed to work in node

## 1.4.2

- fix: `Queue` (dispatcher) returns stack trace instead of just error message

## 1.4.1

- fix: broken contract - `View` could not be created from a domain as a source

## 1.4.0

- fix: merged views processors will receive already fully merged source at first run
- feat: *.map function on all classes
- removed Immutable.Iterable functions from `Data` to promote read & write functions

## 1.3.0

- read & write methods

## 1.2.2

- `Data` exposes Immutable.Set functions too

## 1.2.1

- uglify dist version

## 1.2.0

- `Domain` and `Queue` have been added


