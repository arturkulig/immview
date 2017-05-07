# Simple usage example

In order to create a complete **Domain** we have to create state stream and actions.

## State

Let's create *To do* domain. There should be no misunderstanding about what it should do.

The `Domain` should have a state, so I'll express that with `Atom` that encapsulate `Array<{label: string, done: boolean}>` structure.

```javascript
import { Atom, Domain } from 'immview'

const ToDo$ = new Atom([])
```

That'll create a state stream. We will use it later.

## Actions

Actions for a **Domain** are simply functions. They can be aware of all what is within the **Domain**. In this example, reasonable would be to create `add`, `check` and `remove` actions.

```javascript
const ToDoActions = {
  add(label) {
    ToDo$.next(
      todos => [
        { label, done: false },
        ...todos
      ]
    )
  },

  check(index) {
    ToDo$.next(
      todos => todos.map(
          (todo, i) => (
              i === index
                ? { label: todo.label, done: true }
                : todo
          )
      )
    )
  },

  remove(index) {
    ToDo$.next(
      todos => todos.filter((_, i) => i !== index)
    )
  }
}
```

## Domain

Finally, we are ready to actually create a **Domain** instance, as all parts necessary to do that are in place.

```javascript
const ToDoDomain = Domain.create(
  ToDo$,
  ToDoActions
)
```

That's really all! You can now call an actions on that **Domain** like:

```javascript
ToDoDomain.subscribe(v => console.log(v))
// console: []

ToDoDomain.add('Eat a pizza')
// console: [{ label: "Eat a pizza" }]

ToDoDomain.check(0)
// console: [{ label: "Eat a pizza", done: true }]
```

Domain is now ready to be used to connect it a react component using [immview-react-connect](https://github.com/arturkulig/immview-react-connect).
