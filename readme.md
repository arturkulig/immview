# immview 1.4.2

Immview is a library to create **Domains** - *non-visual components* - similar to flux stores, exposing their **state** through *observables* pushing immutable data structures and having their own, specific to them **actions**. It can be used in place of any flux implementation, redux.

State of a **Domain** can be either *original* data source (**Data**) or *derivative* data source (**View**). **Views** can be **only** a derivative of other stream (or combination of sources) and optionally use a processing function. By connecting these, derivative data source subscribes to all changes of it's source (or sources) and recomputes it's content upon these changes.

If you familiar with stream libraries like Rx\* **Data** can be seen as an observable and **View** be merging and/or mapping of original stream.
All **Domains** must be provided with a state stream (so either **Data** or a **View**), but not all storages must be assigned to a **Domain**.
State storages (thanks to use of Immutable.js) will only push changes only if actual change is detected.

**Domains** are exposing same interface as Data and View and bypassing method calls to assigned streams.

## Installation

Immview is registered on NPM.

```bash
npm i immview --save
```

## Simple down stream example

```javascript
// immview has no default export
import { Data, View } from 'immview';
import { fromJS } from 'immutable';

var sourceStream = new Data(fromJS({ a: 1 }));

var derivativeStream = new View(
	sourceStream,
	data => data.set('b', 2)
);

console.log(sourceStream.toJS());
// {a: 1}
console.log(derivativeStream.toJS());
// {a: 1, b: 2}

/** A CHANGE! */
sourceStream.write(data => data.set('a', 666));

console.log(sourceStream.toJS());
// {a: 666}
console.log(derivativeStream.toJS());
// ..but a derivative data changed as well
// {a: 666, b: 2}
```

## Presentation

If you are using React to create presentation layer of your app you should check [immview-react-connect](https://github.com/arturkulig/immview-react-connect)

#Docs

## Data

```javascript
import {Data} from 'immview';

new Data( initialData: Immutable )
```

An **initialData** object can be object any Immutable.js data structure.

###read() => Immutable

Method used to retrieve current structure holden by the Data.

```javascript
//Example
const source = new Data(fromJS({a: 1}));
source.read().get('a'); // = 1
```

### write(change: Immutable ) => void
### write(change: (currentStructure) => Immutable) => void

Method used to store new Immutable data structure.

**change** parameter:

- is any Immutable data structure that should replace current one. If passed value is either undefined or null, replacement will not occur...
- ...or a function that should return Immutable data structure that should replace current one. If function returns undefined or null, replacement will not occur.

This function will not return changed structure so chaining will not be possible. It is because if this the change is requested during inside queued function (another *write* call or a **Domain** command), it will be postponed and executed after all currently queued commands. You should never presume timing of write execution.

```javascript
const source = new Data(fromJS({a: 1}));
source.write(fromJS({a: 2}));
source.write(data => data.set('b', 3));
```

### subscribe( reaction: (data: Immutable) => void ) => () => void
Registers a function called every time when the Data changes value that it holds. Returns a function to unregister the subscription.

### map( processor: (data: Immutable) => Immutable ) => View (since 1.4)
Creates new **View** with the **Data** instance as a data source and **processor** as transformer function. **Processor** function will receive Immutable data structure and should be returned Immutable data structure too.

### debounce( timeout: number ) => Debounce (since 1.5)
Creates a new stream of values being pushed with a provided delay since last update.

### throttle( timeout: number ) => Throttle (since 1.5)
Creates a new stream of values being push with a provided delay since first update.

## View

```javascript
import {View} from 'immview';

// duplicate source
new View ( sourceDataProvider: Stream )

// join sources into a Map
new View ( sourceDataProvider: { [string]: Stream } )

// transform source with processor function
new View (
	sourceDataProvider: Stream,
	processor: (sourceData: Immutable) => Immutable
	)

// join sources into a Map and transform it with processor function
new View (
	sourceDataProvider: { [string]: Stream } ,
	processor: (sourceData: Immutable) => Immutable
	)
```

Constructor of **View** object takes any source (a stream or a **Domain**) as first argument and optionally function transforming this data as a second argument.
A processor function will receive an Immutable data structure and its result must be any Immutable.js data structure. Returning Null or undefined will result in no subscription being fired.

### View::read() => Immutable

Method used to retrieve current structure holden by the View.

### View::subscribe( reaction: (data) => void ) => () => void
Registers a function called every time when the View changes value that it holds. Returns a function to unregister the subscription.

### View::map( processor: (sourceData: Immutable) => Immutable ) => View (since 1.4)
Creates new View with current instance as a data source and **processor** as transformer function. **Processor** function will receive Immutable data structure and should be returned Immutable data structure too.

### debounce( timeout: number ) => Debounce (since 1.5)
Creates a new stream of values being pushed with a provided delay since last update.

### throttle( timeout: number ) => Throttle (since 1.5)
Creates a new stream of values being push with a provided delay since first update.

## Domain

```javascript
new Domain ( source: Stream )
new Domain ( source: Stream , { [string]: () => void } )
```

First argument of constructor is a data source. That will be a *state* stream of the newly created **Domain**. Only single data source can be tied to it, so **Domain** can be used as data source.

Second argument is an object aggregating functions used to create commands that will be exposed as part of the **Domain** interface. These functions will be wrapped with an internal Dispatcher calls. **Domain** *actions* won't be returning anything and will be executed in call order, **one after another** even if *actions* calls are done from another *action* call.

```javascript
// example usage
import {Data, View, Domain} from 'immview';
const EyesDomain = new Domain(
	new View({
		HorizonDomain,
		MusclesDomain,
	}),
	{
		roll() {
			MusclesDomain.doStuff();
		}
	}
);

EyesDomain.roll();
```

### Domain::read() => Immutable (since 1.2)

Method used to retrieve current Domain's *state*.

> Although **Domain** can be created using **Data**, Domain won't be having **write** method available to discourage writing directly from dependent instances.

### Domain::subscribe( reaction: (data) => void ) => () => void (since 1.2)
Registers a function called every time when the Domain's *state* changes. Returns a function to unsubscribe from updates.

### Domain::map( processor: (sourceData: Immutable) => Immutable ) => View (since 1.4)
Creates new View with the Domain instance source as a data source and **processor** as transformer function. **Processor** function will receive Immutable data structure and should be returned Immutable data structure too.

### debounce( timeout: number ) => Debounce (since 1.5)
Creates a new stream of values being pushed with a provided delay since last update.

### throttle( timeout: number ) => Throttle (since 1.5)
Creates a new stream of values being push with a provided delay since first update.

## Debounce, Throttle
These share interface with a **View**.

## Dispatcher

### Dispatcher.logger (since 1.5)

(default: console)
Replace to change for logging errors in queue runner

### Dispatcher.tick (since 1.5)

(default: console)
Replace to change for logging errors in queue runner

### Dispatcher.dispatch( action: function, context: any, args: Array<any> ) (since 1.5)

Call to place action on a queue. Can be imported directly from package too.
```
import { dispatch } from 'immview';
```

### Dispatcher.rejectContext( context: any ) (since 1.5)

Call to remove actions with provided context from queue.

## TODO

- Streams processing prioritization

##Changelog
###1.5 (coming)

- feat: `Data` writes are prioritized over Domain actions
- feat: `Debounce` and *.debounce added
- feat: `Throttle` and *.throttle added
- `Queue` is now a `Dispatcher`
- feat: `Dispatcher` is exposed now
- feat: `dispatch` function is directly exposed by package for convenience

###1.4.2

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


