**Immview** is a library to create `Domain`s - *non-visual components* -
similar to flux stores, exposing their **state** (through `Atom`s) or emitting **signals**
(through `Observable`s) and having specific to their concerns **actions**.
Their primary role is to encapsulate a concern
and to be the only thing exported from a javascript module or modules
that deal with the concern.

It completely replaces any flux implementation or Redux, although surely could be integrated with one easily.

All `Domain`s must be provided with a single stream of values
(`Atom` or `Observable` class instance),
but not all `Observable`s and `Atom`s must be attached to a `Domain` -
you can perform many transformations on a source
before it is exposed through a `Domain`.
These transformations are done with operators -
functions that exist on these classes prototypes.

## Example
```javascript
import { Atom, Domain } from 'immview'

const ToDo$ = new Atom([])

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

const ToDoDomain = Domain.create(
  ToDo$,
  ToDoActions
)

ToDoDomain.subscribe(v => console.log(v))
// console: []

ToDoDomain.add('Eat a pizza')
// console: [{ label: "Eat a pizza" }]

ToDoDomain.check(0)
// console: [{ label: "Eat a pizza", done: true }]
```