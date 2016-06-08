##Changelog

### 1.6

- feat: `Scan` and `*.scan` added
- fix: `Data` no longer magically transforms initial data provided in constructor to Immutable.js data structure

### 1.5.2
 
- fix: writing during single tick, to the same Data twice or more, causing to reject all but last change

### 1.5.1

- fix: support for deferring ticker replacements

### 1.5

- feat: `Data` writes are prioritized over Domain actions
- feat: streams are sorted so nodes are waiting with their updates for their dependencies are resolved
- feat: `Debounce` and `*.debounce()` added
- feat: `Throttle` and `*.throttle()` added
- feat: `Dispatcher` is exposed now
- feat: `dispatch` function is directly exposed by package for convenience
- feat: guaranteed to work in node

### 1.4.2

- fix: `Queue` (dispatcher) returns stack trace instead of just error message

### 1.4.1

- fix: broken contract - `View` could not be created from a domain as a source

### 1.4.0

- fix: merged views processors will receive already fully merged source at first run
- feat: *.map function on all classes
- removed Immutable.Iterable functions from `Data` to promote read & write functions

### 1.3.0

- read & write methods

### 1.2.2

- `Data` exposes Immutable.Set functions too

### 1.2.1

- uglify dist version

### 1.2.0

- `Domain` and `Queue` have been added


