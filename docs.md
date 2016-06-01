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

### read() => Immutable

Method used to retrieve current structure holden by the View.

### subscribe( reaction: (data) => void ) => () => void
Registers a function called every time when the View changes value that it holds. Returns a function to unregister the subscription.

### map( processor: (sourceData: Immutable) => Immutable ) => View (since 1.4)
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

### read() => Immutable (since 1.2)

Method used to retrieve current Domain's *state*.

> Although **Domain** can be created using **Data**, Domain won't be having **write** method available to discourage writing directly from dependent instances.

### subscribe( reaction: (data) => void ) => () => void (since 1.2)
Registers a function called every time when the Domain's *state* changes. Returns a function to unsubscribe from updates.

### map( processor: (sourceData: Immutable) => Immutable ) => View (since 1.4)
Creates new View with the Domain instance source as a data source and **processor** as transformer function. **Processor** function will receive Immutable data structure and should be returned Immutable data structure too.

### debounce( timeout: number ) => Debounce (since 1.5)
Creates a new stream of values being pushed with a provided delay since last update.

### throttle( timeout: number ) => Throttle (since 1.5)
Creates a new stream of values being push with a provided delay since first update.

## Debounce, Throttle
These share interface with a **View**.

## Dispatcher

### Dispatcher.logger (since 1.5)

Replace to change for logging errors in queue runner
(default: console)

### Dispatcher.tick (since 1.5)

Replace to change how next function is being called.
default:
```
func => func()
```

### Dispatcher.dispatch( action: function, context: any, args: Array<any> ) (since 1.5)

Call to place action on a queue. Can be imported directly from package too.
```
import { dispatch } from 'immview';
```

### Dispatcher.rejectContext( context: any ) (since 1.5)

Call to remove actions with provided context from queue.
