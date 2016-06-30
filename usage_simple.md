# Simple usage example

In order to create a complete **Domain** we have to create state stream and actions.
This example requires you to know and understand [Immutable.js](https://facebook.github.io/immutable-js/) already.

## State

Let's create *To do* domain. It should have it's state and best way to stream it is with expectable structure. We will stream `List<Record<{label: string, done: boolean}>>` then.

```javascript
import { Data, Domain } from 'immview';
import { List, Record } from 'immutable';

const ToDoEntry = Record({label:'', done: false});
const ToDoDomainStream = new Data(List());
```

That'll create a state stream. We will use it later.

## Actions

Actions for a **Domain** are simply functions. They can be aware of all what is within the **Domain**. In this example, reasonable would be to create `add`, `check` and `remove` actions.

```javascript
const ToDoDomainActions = {
  add(label) {
    ToDoDomainStream.write(
      value => value.push(
        new ToDoEntry({ label })
      )
    );
  },

  check(index) {
    ToDoDomainStream.write(
      value => value.setIn(
        [index, 'done'],
        true
      )
    );
  },

  remove(index) {
    ToDoDomainStream.write(
      value => value.remove(index)
    );
  }
};
```

## Domain

Finally, we are ready to actually create a **Domain** instance, as all parts necessary to do that are in place.

```javascript
const ToDoDomain = new Domain(
  ToDoDomainStream,
  ToDoDomainActions
);
```

That's really all! You can now call an actions on that **Domain** like:

```javascript
ToDoDomain.subscribe(v => console.log(v.toJS()));
// []

ToDoDomain.add('Eat a pizza');
// [{ label: "Eat a pizza" }]

ToDoDomain.check(0);
// [{ label: "Eat a pizza", done: true }]
```

> Please, be aware that all action calls and writes on **Data** instances are going to be dispatched to a execution queue that will run them in call order one after another with prioritization of **Data** writes. This won't be even noticable in this example as calls in it are not nested in a way that would reveal it.

Domain is now ready to be used to connect it a react component using [immview-react-connect](https://github.com/arturkulig/immview-react-connect).
