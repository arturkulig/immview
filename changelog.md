# Changelog

## 3.2.2
- fix: `subscribe` function proper signature

## 3.2.1
- fix: `filter` and `distinct` operators are not triggered for initial `Atom`s values

## 3.2

- feat: `Atom`, `Observable` and `Domain` fulfill `PromiseLike` interface. Deref-ing with `await` keyword in possible.
- feat: new class `Process` is running a async function provided to constructor and receiving a observable message box
- fix: Operators (.map, .filter etc) cancel subscription on source if target has been closed
- fix: `AsyncIterable` & `PromiseLike` interfaces in Stream, so streams returned with operators can present it too
- fix: Exiting iteration over stream should not complete that stream

## 3.1

- fix: `Combine` completes upon **any** of sources completion.
- feat: `Atom`, `Observable` and `Domain` fulfill `AsyncIterable` interface making them usable with `for...await...of` loops.

## 3.0

- feat: `Atom` class has beed added. It behaves very much like `Observable`, has a compatible interface, but it is for holding persistent state rather than just pushing messages that have temporary nature. It cannot be created without a state value and upon new subscription `Atom` pushes last state value to that subscriber.
- feat: `Observables` release pending messages as soon as first subscription is created. Making sure all subscriptions meant to be created are already created is up to developer. Usually `Promise.resolve().then(/* here */)` should be sufficient.
- feat: `Combine` extends `Atom` class now instead of `Observable`. `Observable`s can be still connected to a `Combine` instance.

## 2.2

- feat: `Observable.fromPromise`
- feat: `Observable.previous()` returns NO_VALUE (library export) when no value has been pushed yet. Previously `undefined` was returned.

## 2.1

- feat: `Observable::reemit`

## 2.0.0

- feat: **rewrite**
- feat: **Immview** is now written with TypeScript and exposes types declarations.
- feat: `Domain` actions return promises of these being executed.
- feat: `Observable` is a first class citizen of the library, not an implementation detail and mimics [TC39 Observable proposal](https://github.com/tc39/proposal-observable) as closely as possible and in most usable way.
- feat: `Observable::subscribe` callback will not be immediately called with last shared value.
- feat: `Data` is achievable through normal `Observable` creation and pushing values. All `Observable`s are observers (actually all observer's proxy) and can push messages even if are derivative to some other stream..
- feat: `View` functionality will be achievable using `Observable::map` function only.
- feat: `Scan` functionality will be achievable using `Observable::scan` function only.
- feat: `Merge` is renamed to `Combine`.
- feat: `Observable::buffer*` functions are introduced. `Observable`s stream pressure unloading by replacing awaiting values will no longer be.
- feat: `Domain` with actions can now be created through factory `Domain.create`.
- feat: Adding actions while extending `Domain` class can be achieved through `@action` decorator (experimental feature).

---

## 1.7.3
- feat: Domains may be now decorated with function (that become actions) and other fields.

## 1.7.2
- fix: Proxy based immutability was getting in the way of native js functions due to shadowing of referential equality, so it has been disabled.

## 1.7.1
- fix: object once immutabilized is not immutabilized again
- fix: shouldObservableUpdate default implementation was holding back pushing further the same object, but in case it has not been immutabilized too. Now it refrains from pushing the same object if it has been immutabilized before.

## 1.7

- feat: New node `Merge`. Merging multiple source can and should be done with `Merge` and this functionality in `View` is now deprecated.
- feat: New node `Reduce`. Provide it with observable source and function that takes current state and source stream state. 
- feat: Immview no longer depends on `Immutable.js` and doesn't have `Immutable.js` oriented optimizations.
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


