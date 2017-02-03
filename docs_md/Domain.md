# class Domain`<T>` extends [Observable](./Observable)`<T>`
`( source: Observable<T> )`

Class constructor alone will be only helpful when extending `Domain` class.

---
## Domain.create
`( name?: string, source?: observable<T>, actions: { [name: string]: () => promise&lt;any&gt; | void }, fields?: {}) => Domain`

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
## Domain.tagged
`name` => `( source: observable<T> , actions: { [name: string]: () => promise&lt;any&gt; | void }, fields: {}) => Domain`

Basically the same as `Domain.create`,
but it returns a function that receives same arguments as `Domain.create`,
that creates `Domain` using name provided with tagged template string literal.

Helpful for debugging purposes.

```javascript
import {Domain} from 'immview'
Domain.tagged`Yolo`(new Observable(observer => { observer.next('once')}), {})
````

---
## *DomainInstance*.[ACTION_NAME]
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
