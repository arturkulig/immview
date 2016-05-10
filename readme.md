# immview

A library to create data structures with Immutable.js enabling efficient change tracking. It can be used in place of any flux implementation, redux, immstruct+omniscent.

## Idea

Think of the library as tool for creating application layers/**domains** that are encapsulating concerns. These domains are revealing **single storage with [streaming](https://en.wikipedia.org/wiki/Stream_%28computing%29) capability** and an **interface to manipulate that storage** either directly or indirectly if assigned storage is transformation product of some other domain storage.

Storage of a **Domain** can be either original data source (**Data**) or derivative data source (**View**). **Views** can be created as derivative from a **Data**, other **View** or combination of those and optionally use a transformation function. By doing so derivative data source subscribes to all changes to its source or sources and recalculates itself upon these changes optionally using provided transformation function.
Due to this functionality if you familiar with stream libraries like Rx* they can be seen as **Data** being observable and **View** be merging and/or mapping stream.
All **Domains** must have a storage (so either **Data** or a **View**), but not all storages must be assigned to a **Domain**.
**Storages** (thanks to utilizing Immutable.js) will only push changes only if actual change is detected.

**Domains** are exposing interface to either manipulate **Data** instances or use interface of other **Domains**.

### Compounds

#### Downstream

**Data** is independent data source class. Allows direct changes.

**View** is derivative data source class. Consists of **Data** input(s) and processor function. Changes everytime each **Data** input changes.

> They both share interface with `Iterable` of Immutable.js, but `View` is read-only structure.

> Direct changes are queued and executed one after another, so they change reactions will never recur.

#### Upstream

**Domain** is wrapper for both **Data** and **View**, gathering actions so they are executed in queued fashion as well.

> Data-based Domains will be responsible of directly writing to their data sets.

## Installation

Immview is registered on NPM.

```bash
npm i immview --save
```

## Simple down stream example

```javascript
// immview has no default export
import * as IV from 'immview';

var dataSource = new IV.Data({
	a:1,
	b:2,
});

var dataDerivative = new IV.View(
	dataSource,
	data => data.set('c', 3)
);

console.log(dataSource.toJS());
/*
{a: 1, b: 2}
*/

console.log(dataDerivative.toJS());
/*
{a: 1, b: 2, c: 3}
*/

/** A CHANGE! */
dataSource.write(data => data.set('a', 3));

console.log(dataSource.toJS());
/* data source changed
{a: 3, b: 2}
*/

console.log(dataDerivative.toJS());
/* ..but a derivative data changed as well
{a: 3, b: 2, c: 3}
*/
```

## Presentation

If you are using React to create presentation layer of your app you should check [immview-react-connect](https://github.com/arturkulig/immview-react-connect)

#Docs

## Data

```javascript
import {Data} from 'immview';

new Data( initialData: Object )
```

Data have both read and write functions (list below).

Write functions are queued with Domain actions.

An **initialData** object can be object any Immutable.js data structure. Plain objects will be transformed to Immutable.js data structures.

### Data::read() => Iterable

Method used to retrieve current structure holden by the Data.

```javascript
//Example
let d = new Data({a: 1});
d.read().get('a'); // = 1
```

### Data::write(change: Iterable ) => void
### Data::write(change: (currentStructure) => Iterable) => void

Method used to store new Immutable data structure.

**change** parameter:

- is any Immutable data structure that should replace current one. If passed value is either undefined or null, replacement will not occur.
- is a function that should return Immutable data structure that should replace current one. If function returns undefined or null, replacement will not occur.

This function will not return changed structure so chaining will not be possible. It is because if this the change is requested during inside queued function (another *write* call or a **Domain** command), it will be postponed and executed after all currently queued commands. You should never presume timing of write execution.

```javascript
//Example
let d = new Data({a:1});
d.write(d.read().set('b', 2));
```

```javascript
//Example
let d = new Data({a:1});
d.write(structure => structure.set('b', 2));
```

### Data::subscribe( reaction: (data) => void )
Registers a function called every time when the Data changes value that it holds.

### Data::map( processor: (sourceData: Iterable) => Iterable )
Creates new View with the Data instance as a data source and **processor** as transformer function. **Processor** function will receive Immutable data structure and should be returned Immutable data structure too.

## View

```javascript
import {View} from 'immview';

// duplicate Data source
new View ( sourceDataProvider: Data )

// duplicate View source
new View ( sourceDataProvider: View )

// duplicate Domain source
new View ( sourceDataProvider: Domain )

// join sources into a Map
new View ( sourceDataProvider: { [string]: Data/View/Domain } )

// transform Data source with processor function
new View ( sourceDataProvider: Data, processor: (sourceData: Iterable) => Iterable )

// transform View source with processor function
new View ( sourceDataProvider: View , processor: (sourceData: Iterable) => Iterable )

// transform Domain source with processor function
new View ( 
	sourceDataProvider: Domain ,
	processor: (sourceData: Iterable) => Iterable
	)

// join sources into a Map and transform it with processor function
new View (
	sourceDataProvider: { [string]: Data/View/Domain } ,
	processor: (sourceData: Iterable) => Iterable
	)
```

Constructor of View object takes source data provider (Data, View or Domain) as first argument and optionally function transforming this data as a second argument.
A processor function will receive an Immutable data structure and its result must be any Immutable.js data structure.

### View::read() => Iterable

Method used to retrieve current structure holden by the View.

### View::subscribe( reaction: (data) => void )
Registers a function called every time when the View changes value that it holds.

### View::map( processor: (sourceData: Iterable) => Iterable )
Creates new View with current instance as a data source and **processor** as transformer function. **Processor** function will receive Immutable data structure and should be returned Immutable data structure too.

## Domain

```javascript
import {Data, View, Domain} from 'immview';

new Domain ( source: Data )
new Domain ( source: View )

new Domain ( source: Data , { [string]:Function } )
new Domain ( source: View , { [string]:Function } )

// example
const Sight = new View({
	Horizon,
	Muscles,
});

const Eyes = new Domain(
	Sight,
	{
		roll() {
			Muscles.doStuff();
		}
	}
);

Eyes.roll();
```

First argument of constructor is a data source tied to the **Domain**. Can be thought of as a flux's store equivalent. Only single data source can be tied to it, so it can be used as data source, but when you have many approaches to format the same or just related data you can either merge all views to one with...
```
new View ( {view1, view2} );
```

Second argument is an object aggregating functions used to create commands that will be exposed as part of the **Domain** interface. These functions will be wrapped - they won't be returning anything and will be executed in call order, one after another even if calls will be nested, which will be probably very common situation in most installations.
Those functions can be thought of as equivalent of actions and reducers as they will be bubbling events to parent **Domains** or modifying their **Data** sources.

### Domain::read() => Immutable.Iterable

Method used to retrieve current structure holden by the Domain's View or Data.

> Although **Domain** can be created using **Data**, Domain won't be having **write** method available to discourage writing directly from dependent instances.

### Domain::subscribe( reaction: (data) => void )
Registers a function called every time when the Domain's View or Data changes value that it holds.

### Domain::map( processor: (sourceData: Iterable) => Iterable )
Creates new View with the Domain instance source as a data source and **processor** as transformer function. **Processor** function will receive Immutable data structure and should be returned Immutable data structure too.


##Changelog
###1.5

- feat: Data writes are prioritized over Domain actions
- feat: Debounce and *.debounce has been added
- feat: Dispatcher is exposed now, so it's methods can be replaced or used
- feat: dispatch function is directly exposed by package for convenience
- feat: Dispatcher.logger (default: console) can be replaced

###1.4.2

- fix: Queue (dispatcher) returns stack trace instead of just error message

### 1.4.1

- fix: broken contract - View could not be created from a domain as a source

### 1.4.0

- fix: merged views processors will receive already fully merged source at first run
- feat: *.map function on all classes
- removed Immutable.Iterable functions from Data to promote read & write functions

### 1.3.0

- read & write methods

### 1.2.2

- Data exposes Immutable.Set functions too

### 1.2.1

- uglify dist version

### 1.2.0

- Domain and Queue have been added


