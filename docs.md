<!-- TOC -->

- [Documentation](#documentation)
    - [class `Observable`&lt;T&gt;](#class-observablelttgt)
        - [Observable.`of`](#observableof)
        - [Observable.`from`](#observablefrom)
        - [Observable.prototype.`previous`](#observableprototypeprevious)
        - [Observable.prototype.`next`](#observableprototypenext)
        - [Observable.prototype.`error`](#observableprototypeerror)
        - [Observable.prototype.`complete`](#observableprototypecomplete)
        - [Observable.prototype.`subscribe`](#observableprototypesubscribe)
        - [Observable.prototype.`map`](#observableprototypemap)
        - [Observable.prototype.`startWith`](#observableprototypestartwith)
        - [Observable.prototype.`filter`](#observableprototypefilter)
        - [Observable.prototype.`scan`](#observableprototypescan)
        - [Observable.prototype.`flatten`](#observableprototypeflatten)
        - [Observable.prototype.`merge`](#observableprototypemerge)
        - [Observable.prototype.`distinct`](#observableprototypedistinct)
        - [Observable.prototype.`buffer`](#observableprototypebuffer)
        - [Observable.prototype.`bufferCount`](#observableprototypebuffercount)
    - [class `Combine`&lt;T&gt; extends `Observable`&lt;T&gt;](#class-combinelttgt-extends-observablelttgt)
    - [class `Domain`&lt;T&gt; extends `Observable`&lt;T&gt;](#class-domainlttgt-extends-observablelttgt)
        - [Domain.create](#domaincreate)
        - [Domain.tagged](#domaintagged)
        - [*DomainInstance*.[ACTION_NAME]](#domaininstanceaction_name)

<!-- /TOC -->

# Documentation

## class `Observable`&lt;T&gt;

`(subscriber: (observer: {next: (value: T) => void, error: (err: Error) => void, complete: () => void}) => void | () => void)`

Construct with `subscriber` function that receives `observer` object. `Observer` is for pushing values, errors and completion signal.

`Subscriber` function may return function that should be called if `Observable` receives `complete` signal or is cancelled.

---
### Observable.`of`
`(...args: T[]): Observable&lt;T&gt;`

Function to create an `Observable` that immediately pushes values given as arguments.

---
### Observable.`from`
`(values: T[]): Observable&lt;T&gt;`

Function to create an `Observable` that immediately pushes values given as an array of values.

---
### Observable.prototype.`previous`
`() => T`

Returns previous **value** that has been pushed through the `Observable` instance.

```javascript
// Example
const source = new Observable(({next}) => { next(1) })
source.subscribe(value => {
    value === source.previous() // true
})
```

---
### Observable.prototype.`next`
`(nextValue: T) => void`

Sends value signal through the `Observable` instance. Values can be received, by `Observable.prototype.subscribe` method or `Observable.prototype.previous`.

---
### Observable.prototype.`error`
`(error: Error) => void`

Sends error signal through the `Observable` instance. Errors can be received, with `Observable.prototype.subscribe` method.

---
### Observable.prototype.`complete`
`() => void`

Sends `complete` signal through the `Observable` instance. Completion can be handled, with `Observable.prototype.subscribe` method.

---
### Observable.prototype.`subscribe`
`( { start: (sub: Subscription) => void, next: (value: T) => void, error: (err: Error) => void, complete: () => void } ) => { unsubscribe(): void }`

`( onNext?: (value: T) => void, onError?: (err: Error) => void, onCompletion?: () => void ) => { unsubscribe(): void }`

Registers a function called every time when the Observable changes value that it holds, error is pushed or Observable is complete.

Returns a function to unregister the subscription.

---
### Observable.prototype.`map`
`(action: (value: T) => U): Observable&lt;U&gt;`

Creates a derivative stream of values where
every value pushed by a parent is transformed with `action` function and push further by `Observable` -
result of this function call.

---
### Observable.prototype.`startWith`
`(firstValue: T): Observable&lt;T&gt;`

Creates a derivative stream of values where
it has all values of parent stream, but these are preceeded
with `firstValue` that is immediately shared with all other nodes
that subscribed to the newly created stream.

---
### Observable.prototype.`filter`
`(filter: (value: T) => boolean): Observable&lt;T&gt;`

Creates a derivative stream of values where
only those values that meet requirements formulated
with `filter` function are going to be pushed by that derivative `Observable`.

---
### Observable.prototype.`scan`
`(accumulator: (summary: U, value: T, index: number) => U): Observable&lt;U&gt;`

Creates a derivative stream of values where
on every value that parent pushes
there is `accumulator` function called
getting last pushed value and new value that has been pushed by parent `Observable`.

Result of the function is next value of newly created `Observable`.

---
### Observable.prototype.`flatten`
`(): Observable&lt;U&gt;`

When parent `Observable` is releasing other `Observable`s as values
use `flatten` to create a derivative stream that consists only of values
that are released by these "observable values".

---
### Observable.prototype.`merge`
`(...args: Observable&lt;T&gt;[]): Observable&lt;T&gt;

Creates a stream containing all values of parent and of provided in arguments streams.

---
### Observable.prototype.`distinct`
`(): Observable&lt;T&gt;`

Creates a derivative stream of values
but eliminates repeated subsequent value occurences.

---
### Observable.prototype.`buffer`
`(maxLastValues: number = 0): Observable&lt;T[]&gt;`

Creates a derivative stream of parent `Observable` values gathered in array.
New values set is released after
all other `Observable`s values are pushed through
and all `Domain` actions being called.
You can specify how many of there messages has to be remembered.

---
### Observable.prototype.`bufferCount`
`(bufferSize: number, customBufferCount: number = null): Observable&lt;T[]&gt;`

Creates a derivative stream containing parent `Observable` values
gathered in an Array.
New values set is released
every `bufferSize`-th parent `Observable` value or
every `customBufferCount`-th parent `Observable` value
if second argument is present.

As it might be still mysterious how it works
consider these graphical representations
of how values are pushed in time:

```
const a = Observable.of(1, 2, 3, 4, 5)
const b = a.bufferCount(2)

a --1--2--3--4--5--|
b -----[1,2]-[3,4]-[5]|
```

```
const a = Observable.of(1, 2, 3, 4, 5)
const b = a.bufferCount(3, 2) // now with custom window

a --1--2--3----4--5|
b --------[1,2,3]-[3,4,5]|
```

---
## class `Combine`&lt;T&gt; extends `Observable`&lt;T&gt;
`( { [name: string]: Observable } )`

Responsible for being reactive to more than one source and placing source streams contents in their respective (according to informations provided upon initialization) field in result object.

```javascript
const join = new Combine({
    a: new Observable(observer => { observer.next('a') }),
	b: new Observable(observer => { observer.next('b') })
})
join.subscribe(v => {
    console.log(v) // {a: 'a', b: 'b'}
})
```

---
## class `Domain`&lt;T&gt; extends `Observable`&lt;T&gt;
`( source: Observable&lt;T&gt; )`

Class constructor alone will be only helpful when extending `Domain` class.

---
### Domain.create
`( source: observable&lt;t&gt; , actions: { [name: string]: () => promise&lt;any&gt; | void }, fields: {}) => Domain`

`Domain` class by design is the only thing that should be exported and used (maybe with an exception of type definitions) outside of `Domain`s scope.
For example: if you have a folder like:
```
└ SomeDomain
  ├ index.js // here is Domain creation
  ├ SomeDomainState.js // downstream - source observables or stream transformations
  └ SomeDomainActions.js // functions to manipulate `Domain`'s state
```
you should export SomeDomain from index.js and use only that in any other file.

First argument of the factory function is an observable emiting messages that will be emited by the `Domain`'s instance too.
Only single data source can be tied to a **Domain**, but you can always use `Combine` to combine multiple streams.

Second argument is an object aggregating functions used to create actions and other values that will be exposed as part of the **Domain** interface.
Provided functions will be wrapped with an internal Dispatcher calls. That mechanism ensures that they will always be executed one **after** another. That is a design decision which makes it easier to reason about what is happening inside application.
Functions provided as **Domain** *actions* must not return any value.
Calling an action however will return a Promise resolved after action function execution.

```javascript
// example usage
import {Combine, Domain} from 'immview'
import {HorizonDomain} from './HorizonDomain'
import {MusclesDomain} from './MusclesDomain'

const EyesDomain = Domain.create(
	new Combine({
		HorizonDomain,
		MusclesDomain,
	}),
	{
		roll() {
			MusclesDomain.doMuscleStuff()
		}
	},
	{
		EXTRAOCULAR_MUSCLES: 6
	}
)

EyesDomain.roll().then(() => { console.log('I saw that!') })
EyesDomain.EXTRAOCULAR_MUSCLES // 6
```

---
### Domain.tagged
`name` => `( source: observable&lt;t&gt; , actions: { [name: string]: () => promise&lt;any&gt; | void }, fields: {}) => Domain`

Basically the same as `Domain.create`,
but it returns a function that receives same arguments as `Domain.create`,
that creates `Domain` using name provided with tagged template string literal.

Helpful for debugging purposes.

```javascript
import {Domain} from 'immview'
Domain.tagged`Yolo`(new Observable(observer => { observer.next('once')}), {})
````

---
### *DomainInstance*.[ACTION_NAME]
`(...args): Promise`

A function that was in a provided in constructor set of actions.
It is **not** exactly the same function as provided, because it is wrapped with internal scheduler call.
Because it's deferred execution **it always returns a Promise** resolved with that function result.

```javascript
const domain = Domain.create(
	new Observable(observer => { ... }),
	{ foo: () => console.log('bar') }
)
domain.foo()
// prints: 'bar'
```
