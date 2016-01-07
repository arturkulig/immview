#immview

A library to create mutable structures with Immutable.js so it enables changes tracking.
This is similiar to immstruct, but with emphasis on derivative data.

Two classes are available within the lib: `Data` and `View`.
They both have read functions like `Iterable`

Usage:

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

If you are using React to create presentation layer of your app you should check [immview-react-connect](https://github.com/arturkulig/immview-react-connect)
