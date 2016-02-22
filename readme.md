#immview

A library to create data structures with Immutable.js enabling efficient change tracking.

**Data** is independent data source class. Allows direct changes.

**View** is derivative data source class. Consists of **Data** input(s) and processor function. Changes everytime each **Data** input changes.

> Direct changes are queued and executed one after another, so they change reactions will never recur.

**Domain** is wrapper for both, gathering actions so they are executed in queued fashion as well.

## Installation

	npm i immview --save

## Idea

Two classes are available within the lib: `Data` and `View`.
They both share interface with `Iterable` of Immutable.js, but `View` is read-only structure.

## Example

```javascript
var IV = require('immview');

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
initialData will be transformed to Immutable.js structure immediately.

## View

```javascript
import {View} from 'immview';

// duplicate Data source
new View ( dataSource: Data )

// duplicate View source
new View ( dataSource: View )

// join sources into a Map
new View ( dataSources: { [string]: Data/View } )

// transform every Data source with processor function
new View ( dataSource: Data, processor: dataSource => void )

// transform every View source with processor function
new View ( dataSource: View , processor: dataSource => void )

// join sources into a Map and transform it with processor function
new View ( dataSources: { [string]: Data/View } , processor: dataSource => void )
```

## Domain

```javascript
import {Data, View, Domain} from 'immview';

new Domain ( source: Data )
new Domain ( source: View )

new Domain ( source: Data , { [string]:Function } )
new Domain ( source: View , { [string]:Function } )

// example
let Sight = new View ({
	Horizon,
	Muscles,
});

let Eyes = new Domain (
	Sight,
	{
		roll() {
			Muscles.doStuff();
		}
	}
);

Eyes.roll();
```
