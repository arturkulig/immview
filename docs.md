#Docs

## class `Observable`&lt;T&gt;
#### (subscriber: (observer: {next: (value: T) => void, error: (err: Error) => void, complete: () => void}) => void | () => void)
Construct with `subscriber` function that receives `observer` object. `Observer` is for pushing values, errors and completion signal.
`Subscriber` function may return function that should be called if `Observable` receives `complete` signal or is cancelled.

### Observable::last
#### () => T
Returns last **value** that has been pushed through the `Observable` instance.

```javascript
// Example
const source = new Observable(({next}) => { next(1) })
source.subscribe(value => {
    value === source.previous() // true
})
```

### Observable::next
#### (nextValue: T) => void
Sends value signal through the `Observable` instance. Values can be received, by `Observable::subscribe` method or `Observable::previous`.

### Observable::error
#### (error: Error) => void
Sends error signal through the `Observable` instance. Errors can be received, with `Observable::subscribe` method.

### Observable::complete
#### () => void
Sends `complete` signal through the `Observable` instance. Completion can be handled, with `Observable::subscribe` method.

### Observable::subscribe
#### ( { start: (sub: Subscription) => void, next: (value: T) => void, error: (err: Error) => void, complete: () => void } ) => () => void
#### ( onNext?: (value: T) => void, onError?: (err: Error) => void, onCompletion?: () => void ) => () => void
Registers a function called every time when the Observable changes value that it holds, error is pushed or Observable is complete.
Returns a function to unregister the subscription.

### Observable::map
#### (): Observable
// TODO

### Observable::filter
#### (): Observable
// TODO

### Observable::scan
#### (): Observable
// TODO

### Observable::flatten
#### (): Observable
// TODO

### Observable::buffer
#### (): Observable
// TODO

### Observable::bufferCount
#### (): Observable
// TODO


## class `Merge`&lt;T&gt;
#### extends `Observable`&lt;T&gt;
#### ( { [name: string]: Observable } )
Responsible for being reactive to more than one source and placing source streams contents in their respective (according to informations provided upon initialization) field in result object.

```javascript
const join = new Merge({
    a: new Observable(observer => { observer.next('a') }),
	b: new Observable(observer => { observer.next('b') })
})
join.subscribe(v => {
    console.log(v) // {a: 'a', b: 'b'}
})
```

## class `Domain`&lt;T&gt;
#### extends `Observable`&lt;T&gt;
#### ( source: Observable&lt;T&gt; )

Class constructor alone will be only helpful when extending `Domain` class.

### Domain.create&lt;T&gt;
####( source: observable&lt;t&gt; , actions: { [name: string]: () => promise&lt;any&gt; | void }, fields: {}) => Domain

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
Only single data source can be tied to a **Domain**, but you can always use `Merge` to combine multiple streams.

Second argument is an object aggregating functions used to create actions and other values that will be exposed as part of the **Domain** interface.
Provided functions will be wrapped with an internal Dispatcher calls. That mechanism ensures that they will always be executed one **after** another. That is a design decision which makes it easier to reason about what is happening inside application.
Functions provided as **Domain** *actions* must not return any value.
Calling an action however will return a Promise resolved after action function execution.

```javascript
// example usage
import {Merge, Domain} from 'immview'
import {HorizonDomain} from './HorizonDomain'
import {MusclesDomain} from './MusclesDomain'

const EyesDomain = Domain.create(
	new Merge({
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

### Domain.tagged
#### `name` => ( source: observable&lt;t&gt; , actions: { [name: string]: () => promise&lt;any&gt; | void }, fields: {}) => Domain

Basically the same as `Domain.create`, but it returns a function that receives same arguments as `Domain.create`, but creates `Domain` that uses name provided with tagged template string literal.

```javascript
import {Domain} from 'immview'
Domain.tagged`Yolo`(new Observable(observer => { observer.next('once')}), {})
````

### Domain::[ACTION_NAME]
#### (...args): Promise
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
