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

const toDoList$ = new Atom([])

const toDoActions = {
  add(label) {
    toDoList$.next(
      todos => [
        { label, done: false },
        ...todos
      ]
    )
  },

  check(index) {
    toDoList$.next(
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
    toDoList$.next(
      todos => todos.filter((_, i) => i !== index)
    )
  }
}

const ToDo$ = Domain.create(
  toDoList$,
  toDoActions
)

ToDo$.subscribe(v => console.log(JSON.stringify(v)))
// console: []

ToDo$.add('Eat a pizza')
// console: [{ label: "Eat a pizza", done: false }]

ToDo$.check(0)
// console: [{ label: "Eat a pizza", done: true }]
```

## Demo

> see above live on https://runkit.com/arturkulig/immview-todo-example

## React

If you are using React to create presentation layer of your app you should check [immview-react-connect](https://github.com/arturkulig/immview-react-connect)
