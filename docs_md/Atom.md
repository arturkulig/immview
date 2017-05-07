# class `Atom<T>`

`new (initialState: T)`

Instantiate an `Atom` with it's default state.

---
## static *of*
`(...args: T[]): Atom<T>;`

Function to create an `Atom` that's state set to last given argument.

```javascript
const a = Atom.of(1, 2, 3)
console.log(a.deref()) // 3
```

**Stream is immediately completed after all values are pushed.**

---
## static *from*
`(values: T[]): Atom<T>;`

Function to create an `Atom` that's state set to last value of an `Iterable`.
Given other `Atom`, copies it's state.

**Stream is immediately completed after all values are pushed.**

# Subscribable interface

---
## subscribe
`( { start: (sub: Subscription) => void, next: (value: T) => void, error: (err: Error) => void, complete: () => void } ) => { unsubscribe(): void }`

`( onNext?: (value: T) => void, onError?: (err: Error) => void, onCompletion?: () => void ) => { unsubscribe(): void }`

Registers a function called every time when the `Atom` changes value that it holds, error is pushed or `Atom` is complete.

Returns a function to unregister the subscription.

---
## toPromise
`() => T`

Returns next **value** that's going to be pushed through the `Atom` instance.

```javascript
// Example
const source = new Atom()
setTimeout(() => source.next(1), 100)
const value = await source.toPromise()
```

# Observer interface

---
## next
`(nextValue: T) => void`

Sends value signal through the `Atom` instance. Values can be received, by `Atom.prototype.subscribe` method or `Atom.prototype.previous`.

---
## error
`(error: Error) => void`

Sends error signal through the `Atom` instance. Errors can be received, with `Atom.prototype.subscribe` method.

---
## complete
`() => void`

Sends `complete` signal through the `Atom` instance. Completion can be handled, with `Atom.prototype.subscribe` method.

# Operators - common

---
## map
`(action: (value: T) => U): Atom<U>`

Creates a derivative stream of values where
every value pushed by a parent is transformed with `action` function and push further by `Atom` -
result of this function call.

---
## filter
`(filter: (value: T) => boolean): Atom<T>;`

Creates a derivative stream of values where
only those values that meet requirements formulated
with `filter` function are going to be pushed by that derivative `Atom`.

**First value of `Atom` is not validated by provided function**

---
## scan
`(accumulator: (summary: U, value: T, index: number) => U, defaultValue?: U): Atom<U>`

Creates a derivative stream of values where
on every value that parent pushes
there is `accumulator` function called
getting last pushed value and new value that has been pushed by parent `Atom`.
Result of the function is next value of newly created `Atom`.
First call is with summary being undefined unless `defautValue` is also passed.

---
## flatten
`(): Atom<U>`

When parent `Atom` is releasing other `Atom`s as values
use `flatten` to create a derivative stream that consists only of values
that are released by these "Atom values".

---
## merge
`(...args: Atom<T>;[]): Atom<T>;

Creates a stream containing all values of parent and of provided in arguments streams.

---
## distinct
`(comparator?: (prev: T, next: T) => boolean): Atom<T>;`

Creates a derivative stream of values
but eliminates repeated subsequent value occurences.

If `comparator` is passed, it is going to be used
to determine if a value is distinct from previous one.
Otherwise strict equal is incorporated.

---
## buffer
`(maxLastValues: number = 0): Atom<T[]>`

Creates a derivative stream of parent `Atom` values gathered in array.
New values set is released after
all other `Atom`s values are pushed through
and all `Domain` actions being called.
You can specify how many of there messages has to be remembered.

---
## materialize
`(defaultState: T): Atom<T>`

Returns itself.
