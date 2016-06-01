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
