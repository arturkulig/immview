# immview

A library to create data structures with Immutable.js enabling efficient change tracking. It can be used in place of any flux implementation, redux, immstruct+omniscent.

## Idea

With full usage of the library, you can think of it as of streams lines going only vertically, layer by layer, so it is always clear which layer depends on each other. **Down streams** (because of usage of Immutable.js) will only push data further only if data they contain (**Data**) or produce (**View**) actually changed. Layer **up stream** is a way to signal upper layers - they are counterpart of actions in flux. 

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

## Example

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
dataSource.set('a', 3);

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

### Data::read() => Immutable.Iterable

Method used to retrieve current structure holden by the Data.

```javascript
//Example
let d = new Data({a: 1});
d.read().get('a'); // = 1
```

### Data::write(change: Immutable.Iterable ) => void
### Data::write(change: (currentStructure) => Immutable.Iterable) => void

Method used to store new Immutable data structure.

**change** parameter:

- is any Immutable data structure that should replace current one. If passed value is either undefined or null, replacement will not occur.
- is a function that should return Immutable data structure that should replace current one. If function returns undefined or null, replacement will not occur.

This function will not return changed structure so chaining will not be possible. It is because if this the change is requested mid queue run, it will be postponed and executed after all currently queued commands.

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

## View

```javascript
import {View} from 'immview';

// duplicate Data source
new View ( dataSource: Data )

// duplicate View source
new View ( dataSource: View )

// duplicate Domain source
new View ( dataSource: Domain )

// join sources into a Map
new View ( dataSources: { [string]: Data/View/Domain } )

// transform Data source with processor function
new View ( dataSource: Data, processor: dataSource => void )

// transform View source with processor function
new View ( dataSource: View , processor: dataSource => void )

// transform Domain source with processor function
new View ( dataSource: Domain , processor: dataSource => void )

// join sources into a Map and transform it with processor function
new View ( dataSources: { [string]: Data/View/Domain } , processor: dataSource => void )
```

A View instance has only read functions (list below).
A processor function result can be any Immutable.js data structure.

### View::read() => Immutable.Iterable

Method used to retrieve current structure holden by the View.

### View::subscribe( reaction: (data) => void )
Registers a function called every time when the View changes value that it holds.

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

### Domain::read() => Immutable.Iterable

Method used to retrieve current structure holden by the Domain's View or Data.

> Although **Domain** can be created using **Data**, Domain won't be having **write** method available to discourage writing directly from dependent instances.

### Domain::subscribe( reaction: (data) => void )
Registers a function called every time when the Domain's View or Data changes value that it holds.
