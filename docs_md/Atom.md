# class `Atom<T>`

`new (initialState: T)`

Instantiate an `Atom` with it's default state.

---
### static *of*
`(...args: T[]): Atom<T>;`

Function to create an `Atom` that's state set to last given argument.

```javascript
const a = Atom.of(1, 2, 3)
console.log(a.deref()) // 3
```

> **Important**
>
> Stream is immediately completed after all values are pushed.

---
### static *from*
`(values: T[]): Atom<T>;`

Function to create an `Atom` that's state set to last value of an `Iterable`.
Given other `Atom`, copies it's state.

> **Important**
>
> Stream is immediately completed after all values are pushed.

## Subscribable interface

---
### subscribe
`({`
`start: (sub: Subscription) => void,`
`next: (value: T) => void,`
`error: (err: Error) => void,`
`complete: () => void`
`} ) => { unsubscribe(): void }`

```javascript
new Atom(0).subscribe({
    start(){},
    next(value){ console.log(value) },
    error(){}
    complete(){}
})
```

`(`
`onNext?: (value: T) => void,`
`onError?: (err: Error) => void,`
`onCompletion?: () => void`
`) => { unsubscribe(): void }`

```javascript
new Atom(0).subscribe(
    function onNext(value) { console.log(value) }
)
```

Registers a function called every time when the `Atom` changes value that it holds, error is pushed or `Atom` is complete.

Returns a function to unregister the subscription.

---
### toPromise
`() => Promise<T>`

Returns **value** that's has been pushed through the `Atom` instance.
**You should not use that method if you know for sure, you are using an `Atom`.**
Method has been implemented, so `Atom` have common interface with an `Observable`.

```javascript
// Example
const source = new Atom()
setTimeout(() => source.next(1), 100)
const value = await source.toPromise()
```

## Promise interface

`Atom`s are also implementing interface of a `Promise`,
 so it actually is possible to deref as if `Atom` was a `Promise`
 and use it both with `.then` and `async..await`

### with `await`
```javascript
(async function () {
    console.log(await new Atom(1)) // logs: 1
})()
```

### then
`<U>(onsuccess?: (value: T) => Promise<U> | U, onrejection?: (reason: any) => any): Promise<U>`
```javascript
new Atom(1).then(_ => console.log(_)) // logs: 1
```

> **Notice**
>
> `Atom` as `Promise` will resolve immediately, so if you would like to use it to asynchronously iterate over subsequent values emitted by the `Atom` you should first convert it to `Observable` with `.vaporize`. Interface has been implemented so it is compatible with `Observable`.

## AsyncIterable interface

`Observable`s implement interface for asynchronous iteration with `for..await..of` looping.
```javascript
let source = new Observable()
(async () => {
   for await (let value of source) {
       console.log(value)
   }
})()
source.next(1)
source.next(2)
// logs 1
// logs 2
```

## Observer interface

---
### next
`(nextValue: T) => void`

Sends value signal through the `Atom` instance.
Values can be received, by `.subscribe`, `.toPromise`, `.then` methods
or through asynchronous iteration over the `Atom`.

---
### error
`(error: Error) => void`

Sends error signal through the `Atom` instance. Errors can be received, with `.subscribe` method.

---
### complete
`() => void`

Sends `complete` signal through the `Atom` instance. Completion can be handled, with `.subscribe` method.

## Operators - common

---
### map
`(action: (value: T) => U): Atom<U>`

Creates a derivative stream of values where
every value pushed by a parent is transformed with `action` function and push further by `Atom` -
result of this function call.

---
### filter
`(filter: (value: T) => boolean): Atom<T>;`

Creates a derivative stream of values where
only those values that meet requirements formulated
with `filter` function are going to be pushed by that derivative `Atom`.

> **Warning**
>
> First value of `Atom` is not validated by provided function.
> `Atom` instance has to always have a state.

---
### scan
`(accumulator: (summary: U, value: T, index: number) => U, defaultValue?: U): Atom<U>`

Creates a derivative stream of values where
on every value that parent pushes
there is `accumulator` function called
getting last pushed value and new value that has been pushed by parent `Atom`.
Result of the function is next value of newly created `Atom`.
First call is with summary being undefined unless `defautValue` is also passed.

---
### flatten
`(): Atom<U>`

When parent `Atom` is releasing other `Atom`s as values
use `flatten` to create a derivative stream that consists only of values
that are released by these "Atom values".

---
### merge
`(...args: Atom<T>;[]): Atom<T>;

Creates a stream containing all values of parent and of provided in arguments streams.

---
### distinct
`(comparator?: (prev: T, next: T) => boolean): Atom<T>;`

Creates a derivative stream of values
but eliminates repeated subsequent value occurences.

If `comparator` is passed, it is going to be used
to determine if a value is distinct from previous one.
Otherwise strict equal is incorporated.

---
### buffer
`(maxLastValues: number = 0): Atom<T[]>`

Creates a derivative stream of parent `Atom` values gathered in array.
New values set is released after
all other `Atom`s values are pushed through
and all `Domain` actions being called.
You can specify how many of there messages has to be remembered.

---
### materialize
`(defaultState: T): Atom<T>`

Returns itself.

---
### vaporize
`(): Observable<T>`

Returns an `Observable` that is subscriber to the source `Atom`.
