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
    value === source.last() // true
})
```

### Observable::cancel
#### () => void
Sends `complete` signal through the `Observable` instance.

### Observable::subscribe
#### ( onNext?: (value: T) => void, onError?: (err: Error) => void, onCompletion?: () => void ) => () => void
Registers a function called every time when the Observable changes value that it holds, error is pushed or Observable is complete.
Returns a function to unregister the subscription.


## class `Origin`&lt;T&gt;
#### extends `Observable`&lt;T&gt;
#### ( initialData: T )
```javascript
import {Origin} from 'immview'
new Origin( 2 )
```
**Origin** class is a top level node, observable that enables pushing values through it with it's `push` method.

### Origin::push
#### (change: T ) => void
#### (change: (currentStructure) => T) => void

Method used to push new message of type `T` to observers.

**change** parameter is:

- any data structure that should replace current one.
- a function that should return a data structure that should replace current one.

```javascript
const source = new Origin({a: 1})
source.push({a: 2})

/*
be also warned, that you should not change any data structures you are given inside these functions
*/
source.push(data => ({ ...data, b: 3}))
```

In both ways replacement will be postponed and executed after all currently queued commands.

## class `Merge`&lt;T&gt;
#### extends `Observable`&lt;T&gt;
#### ( { [name: string]: Observable } )
Responsible for being reactive to more than one source and placing source streams contents in their respective (according to informations provided upon initialization) field in result object.

```javascript
const join = new Merge({
	a: new Origin('a'),
	b: new Origin('b')
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
####( source: Observable&lt;T&gt; , actions: { [name: string]: () => Promise&lt;any&gt; | void }, fields: {})

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
import {Origin, Merge, Domain} from 'immview'
import {HorizonDomain} from './HorizonDomain'
import {MusclesDomain} from './MusclesDomain'

const EyesDomain = Domain.create(
	new Merge({
		HorizonDomain,
		MusclesDomain,
	}),
	{
		roll() {
			MusclesDomain.doStuff()
		}
	},
	{
		EXTRAOCULAR_MUSCLES: 6
	}
)

EyesDomain.roll().then(() => { console.log('I saw that!') })
EyesDomain.EXTRAOCULAR_MUSCLES // 6
```

### Domain::[ACTION_NAME]
function that existed on a set of functions provided as actions in constructor. It is not exactly the same function as it is wrapped, so it is run in **Dispatcher** queue.

```javascript
const domain = Domain.create(
	new Origin(0),
	{ foo: () => console.log('bar') }
)
domain.foo()
// prints: 'bar'
```
