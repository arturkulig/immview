#Docs

> Any types are provided in descriptions follow **flowtype** style.

- [abstract class Observable](#abstract-class-observable)
- [class Domain](#class-domain)
- [class Data](#class-data)
- [class View](#class-view)
- [class Merge](#class-merge)
- [class Debounce](#class-debounce)
- [class Throttle](#class-throttle)
- [class Scan](#class-scan)
- [module Dispatcher](#module-dispatcher)

## abstract class `Observable`

### Observable::read
#### () => mixed

Method used to retrieve current structure holden by the Observable.

```javascript
// Example
const source = new Data({a: 1})
source.read().a // = 1
```

### Observable::subscribe
#### ( reaction: (data: mixed) => void ) => () => void
Registers a function called every time when the Observable changes value that it holds.
Returns a function to unregister the subscription.

### Observable::map
#### ( processor: (data: mixed) => mixed ) => View (since 1.4)
Creates new **View** with the current instance as a data source and **processor** as function applying onto it's source stream state. **Processor** function will receive a data structure and should return data structure that will become that **View** instance state. Read more in **View** section.

### Observable::debounce
#### ( timeout: number ) => Debounce (since 1.5)
Creates a new stream of values being pushed with a provided delay since last update.

### Observable::throttle
#### ( timeout: number ) => Throttle (since 1.5)
Creates a new stream of values being push with a provided delay since first update.

### Observable::scan
#### ( valuesToRemember: number, initialValue: any ) => Scan (since 1.6)
Creates  a new stream of `List` of values that were pushed from a source stream recently. List has a max length of `valuesToRemember` argument. Additionally for first `valuesToRemember - 1` runs if `initialValue` is provided, `List` of values is always `valuesToRemember` long and filled with `initialValue` for not yet existing steps.

## class `Domain`
#### extends `Observable`
#### ( source: Observable )
#### ( source: Observable , { [name: string]: () => void } )

First argument of constructor is a data source. It can be any observable element listed below. That will be a *state* stream of the newly created **Domain**. Only single data source can be tied to a **Domain**, and because of that any **Domain** can be used as data source.

Second argument is an object aggregating functions used to create commands that will be exposed as part of the **Domain** interface. These functions will be wrapped with an internal Dispatcher calls. **Domain** *actions* won't be returning anything and will be executed in call order, **one after another** even if *actions* calls are done from another *action* call.

```javascript
// example usage
import {Data, Merge, Domain} from 'immview'

const EyesDomain = new Domain(
	new Merge({
		HorizonDomain,
		MusclesDomain,
	}),
	{
		roll() {
			MusclesDomain.doStuff()
		}
	}
)

EyesDomain.roll()
```

### Domain::read (since 1.2)

bypassed to state stream given in constructor (see `Data.read`)

> Although **Domain** can be created using **Data**, Domain won't be having **write** method available to discourage writing directly from dependent instances.

### Domain::subscribe (since 1.2)
bypassed to state stream given in constructor (see `Data.subscribe`)

### Domain::map (since 1.4)
bypassed to state stream given in constructor (see `Data.map`)

### Domain::debounce (since 1.5)
bypassed to state stream given in constructor (see `Data.debounce`)

### Domain::throttle (since 1.5)
bypassed to state stream given in constructor (see `Data.throttle`)

### Domain::scan (since 1.6)
bypassed to state stream given in constructor (see `Data.scan`)

### Domain::[ACTION_NAME]
function that existed on a set of functions provided as actions in constructor. It is not exactly the same function as it is wrapped, so it is run in **Dispatcher** queue.

```javascript
const domain = new Domain(
	new Data(0),
	{ foo: () => console.log('bar') }
)
domain.foo()
// prints: 'bar'
```

### Domain::[ACTION_NAME].originalLength (since 1.6)
Amount of arguments indicated by original action function

```javascript
domain.foo.originalLength // 0
```

## class `Data`
#### extends `Observable`
#### ( initialData: mixed )
```javascript
import {Data} from 'immview'

new Data( 2 )
```

An **initialData** object can be object any native immutable (bool, string, number) or Immutable.js data structure.

### Data::write
#### (change: mixed ) => void
#### (change: (currentStructure) => mixed) => void

Method used to store new data structure.

**change** parameter is:

- any data structure that should replace current one. If passed value is either undefined or null, replacement will not occur;
- a function that should return a data structure that should replace current one. If function returns undefined or null, replacement will not occur.

```javascript
const source = new Data({a: 1})
source.write({a: 2})

/*
be also warned, that you should not change any data structures you are given inside these functions
*/
source.write(data => ({ ...data, b: 3}))
```

If already inside **Dispatcher** queue, replacement will be postponed and executed after all currently queued commands. This may be even more varied with non-standard **Dispatcher.tick** function. **You should never presume timing of write execution.**

## class `View`
#### extends `Observable`
#### ( source: Observable, processor: (sourceData: mixed) => mixed )

```javascript
import { Data, View } from 'immview'

// transform source with processor function
const place = new Data(0)
const transformation = new View (place, v => v + 1)
transformation.read() === 1 // true

place.write(1)
transformation.read() === 2 // true
```

Constructor of **View** object takes any source (a stream or a **Domain**) as first argument and optionally function transforming this data as a second argument.
A processor function will receive a value and has to return next one that will be state of current node.

*Returning **null** or undefined will result in no subscription being fired.*

### View::read
Same as `Data` function of the same name.

### View::subscribe
Same as `Data` function of the same name.

### View::map (since 1.4)
Same as `Data` function of the same name.

### View::debounce (since 1.5)
Same as `Data` function of the same name.

### View::throttle (since 1.5)
Same as `Data` function of the same name.

### View::scan (since 1.6)
Same as `Data` function of the same name.

## class `Merge`
(since 1.7)
#### extends `Observable`
#### ( { [name: string]: Observable } )
Responsible for being reactive to more than one source and placing source streams contents in their respective (according to informations provided upon initialization) place.

```javascript
const join = new Merge({
	a: new Data('a'),
	b: new Data('b')
})
join.read() // { a: 'a', b: 'b' }
```

## class `Debounce`
(since 1.5)
#### extends `Observable`
#### ( source: Observable, delay: number )

```javascript
new Debouce(sourceStream, 10)
// or
sourceStream.debounce(10)
```

Creates a new stream of values being pushed with a provided delay since **last** update.
Shares interface with a **View**.

## class `Throttle`
(since 1.5)
#### extends `Observable`
#### ( source: Observable, delay: number )

```javascript
new Throttle(sourceStream, 10)
// or
sourceStream.throttle(10)
```

Creates a new stream of values being push with a provided delay since **first** update.
Shares interface with a **View**.

## class `Scan`
(since 1.6)
#### extends `Observable`
#### ( source: Observable, valuesToRemember: number = 2, initialValue: any = null )

```javascript
new Scan(sourceStream, 2)
// or
sourceStream.scan(2)

new Scan(sourceStream, 2, {})
// or
sourceStream.scan(2, {})

const source = new Data(0)
const trans =
	source
		.scan(2)
		.map(
			numbers => numbers.reduce((sum, num) => sum + num)
		)
trans.read() === 0

source.write(1)
trans.read() === 1

source.write(2)
trans.read() === 3

source.write(3)
trans.read() === 5
```

Creates  a new stream of `Arrays` of values that were pushed from a source stream recently. List has a max length of `valuesToRemember` argument. Additionally if `initialValue` is provided for first `valuesToRemember - 1` runs , `Array` of values is always `valuesToRemember` long and filled with `initialValue` for not yet existing steps.

Shares interface with a **View**.

## module `Dispatcher`

### Dispatcher.logger (since 1.5)

Replace to change for logging errors in queue runner
```javascript
// default
Dispatcher.logger = console;
```

### Dispatcher.tick (since 1.5)

Replace to change how next function is being called.
```javascript
// default
Dispatcher.tick = func => func();
```

### Dispatcher.dispatch( action: function, context: any, args: any[] ) (since 1.5)

Call to place action on a queue. Can be imported directly from package too.
```javascript
// example

Dispatcher.dispatch( console.log, console, ['oi!'] );
// 'oi!'
```

### Dispatcher.rejectContext( context: any ) (since 1.5)

Call to remove actions with provided context from queue.
```javascript
// example
Dispatcher.dispatch( () => {
  console.log('ay!');
  Dispatcher.dispatch( console.log, console, ['oi!'] );
  Dispatcher.rejectContext( console );
} );
// 'ay!'
```
