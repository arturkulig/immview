# class Domain`<T>`
`new ( source: Observable<T> )`

Class constructor alone will be only helpful when extending `Domain` class.

You can create a `Domain` either through class inheritance or with factory function `Domain.create`.

`Domain` have operator functions on prototype
that are present both in `Observable` and `Atom`
and calling them will actually call operators on stream object
that the `Domain` has been provided with.

---
## new Domain through inheritance
```javascript
import {Combine, Domain, action} from 'immview'
import {HorizonDomain} from './HorizonDomain'
import {MusclesDomain} from './MusclesDomain'

const EyesDomain = (() => {
	class EyesDomain extends Domain {
		constructor() {
			super(
				new Combine({
					horizon: HorizonDomain,
					muscles: MusclesDomain,
				})
			)
		}

		@action
		roll() {
			MusclesDomain.doMuscleStuff()
		}
	}
	return new EyesDomain()
})()
```

---
## Domain.create`<T>`
`(source: Observable<T> | Atom<T>, actions: { [name: string]: () => promise&lt;any&gt; | void }, fields?: {}) => Domain`

`Domain` class by design is the only thing that should be exported and used (maybe with an exception of type definitions) outside of `Domain`s scope.

For example, if you have a folder like...
```
└ SomeDomain
  ├ index.js // just export
  ├ SomeDomain.js // here is Domain creation
  ├ SomeDomainState.js // downstream - source observables or stream transformations
  └ SomeDomainActions.js // functions to manipulate `Domain`'s state
```
...or just...
```
└ SomeDomain.js // everything
```
...you should export SomeDomain from index.js and use only that in any other JavaScript module.

First argument of the factory function is an observable emiting messages that will be emited by the `Domain`'s instance too.
Only single data source can be tied to a **Domain**, but you can always use `Combine` to combine multiple streams.

Second argument is an object aggregating functions used to create actions and other values that will be exposed as part of the **Domain** interface.
Provided functions will be wrapped with an internal Dispatcher calls. That mechanism ensures that they will always be executed one **after** another. That is a design decision which makes it easier to reason about what is happening inside application.
Functions provided as **Domain** *actions* must not return any value.
Calling an action however will return a Promise resolved after action function execution.

```javascript
// example usage
import { Combine, Domain } from 'immview'
import { HorizonDomain } from './HorizonDomain'
import { MusclesDomain } from './MusclesDomain'

const EyesDomain = Domain.create(
	new Combine({
		horizon: HorizonDomain,
		muscles: MusclesDomain,
	}),
	{
		roll
	}
)

function roll() {
	MusclesDomain.doMuscleStuff()
}

// usage...

EyesDomain.roll().then(() => { console.log('I saw that!') })
```

---
## *DomainInstance*.[ACTION_NAME]
`(...args): Promise<any> | void`

A function that was in a provided in constructor set of actions.
It is **not** exactly the same function as provided, because it is wrapped with internal scheduler call.
Because it's potentially deferred execution **it always returns a `Promise`** resolved with that function result.
If function throws, `Promise` will be rejected.

```javascript
const domain = Domain.create(
	new Observable(observer => { ... }),
	{ foo: () => console.log('bar') }
)
domain.foo()
// prints: 'bar'
```
