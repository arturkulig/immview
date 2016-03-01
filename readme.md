# immview

A library to create data structures with Immutable.js enabling efficient change tracking. It can be used in place of any flux implementation, redux, immstruct+omniscent.

## Idea

With full usage of the library, you can think of it as of streams lines going only vertically, layer by layer, so it is always clear which layer depends on each other. **Down streams** (because of usage of Immutable.js) will only push data further only if data they contain (**Data**) or produce (**View**) actually changed. Layer **up stream** is a way to signal upper layers - they are counterpart of actions in flux. 

## Compounds

### Downstream

**Data** is independent data source class. Allows direct changes.

**View** is derivative data source class. Consists of **Data** input(s) and processor function. Changes everytime each **Data** input changes.

> They both share interface with `Iterable` of Immutable.js, but `View` is read-only structure.

> Direct changes are queued and executed one after another, so they change reactions will never recur.

### Upstream

**Domain** is wrapper for both **Data** and **View**, gathering actions so they are executed in queued fashion as well.

> Data-based Domains will be responsible of directly writing to their data sets.

## Installation

```bash
npm i immview --save
```

## Example

```javascript
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

> Data have both read and write functions (list below).

> Write functions are queued with Domain actions.

> An initialData object can be object any Immutable.js data structure. Plain objects will be transformed to Immutable.js data structures.

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

> A View instance has only read functions (list below).
> A processor function result can be any Immutable.js data structure.

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

## Read functions
- equals
- hashCode
- get
- has
- includes
- first
- last
- getIn
- hasIn
- toJS
- toObject
- toArray
- toMap
- toOrderedMap
- toSet
- toOrderedSet
- toList
- toStack
- toSeq
- toKeyedSeq
- toIndexedSeq
- toSetSeq
- keys
- values
- entries
- keySeq
- valueSeq
- entrySeq
- map
- filter
- filterNot
- reverse
- sort
- sortBy
- groupBy
- forEach
- slice
- rest
- butLast
- skip
- skipLast
- skipWhile
- skipUntil
- take
- takeLast
- takeWhile
- takeUntil
- concat
- flatten
- flatMap
- reduce
- reduceRight
- every
- some
- join
- isEmpty
- count
- countBy
- find
- findLast
- findEntry
- findLastEntry
- max
- maxBy
- min
- minBy
- isSubset
- isSuperset

## Write functions
- set
- delete
- update
- merge
- mergeDeep
- setIn
- deleteIn
- updateIn
- mergeIn
- mergeDeepIn
- add
- clear
- union
- intersect
- substract
