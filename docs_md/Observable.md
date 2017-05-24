# class `Observable<T>`

`new (subscriber: (observer: {next: (value: T) => void, error: (err: Error) => void, complete: () => void}) => void | () => void)`

Construct with `subscriber` function that receives `observer` object. `Observer` is for pushing values, errors and completion signal.

`Subscriber` function may return function that should be called if `Observable` receives `complete` signal or is cancelled.

---
### static *of*
`(...args: T[]): Observable<T>;`

Function to create an `Observable` that immediately pushes values given as arguments.


> **Important**
>
> Stream is immediately completed after all values are pushed.

If you wish to create a stream and kickstart it with a value(s), use `startWith`.

---
### static *from*
`(values: T[]): Observable<T>;`

Function to create an `Observable` that immediately pushes values given as an array of values.

> **Important**
>
> Stream is immediately completed after all values are pushed.

If you wish to create a stream and kickstart it with a value(s), use `startWith`.

---
### static *fromPromise*
`(values: Promise<T>): Observable<T>`

Function to create an `Observable` that pushes a value
revealed with provided `Promise` and then completes
as no more values to get from it.

## Subscribable interface

---
### subscribe
`({`
`start: (sub: Subscription) => void,`
`next: (value: T) => void,`
`error: (err: Error) => void,`
`complete: () => void`
`} ) => { unsubscribe(): void }`

`(`
`onNext?: (value: T) => void,`
`onError?: (err: Error) => void,`
`onCompletion?: () => void`
`) => { unsubscribe(): void }`

Registers a function called every time when the Observable changes value that it holds, error is pushed or Observable is complete.

Returns a function to unregister the subscription.

---
### toPromise
`() => Promise<T>`

Returns next **value** that's going to be pushed through the `Observable` instance.

```javascript
// Example
const source = new Observable()
setTimeout(() => source.next(1), 100)
const value = await source.toPromise()
```

## Promise interface

`Observable`s are also implementing interface of a `Promise`,
 so it actually is possible to deref as if `Observable` was a `Promise`
 and use it both with `.then` and `async..await`

### with `await`
```javascript
(async () => {
    console.log(
        await new Observable(observer => { observer.next(1) })
    )
    // logs: 1
})()
```

### then
`<U>(onsuccess?: (value: T) => Promise<U> | U, onrejection?: (reason: any) => any): Promise<U>`
```javascript
    new Observable(
        observer => { observer.next(1) }).then(_ => console.log(_)
    )
    // logs: 1
```

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

Sends value signal through the `Observable` instance. 
Values can be received, by `.subscribe`, `.toPromise`, `.then` methods 
or through asynchronous iteration over the `Observable`.

---
### error
`(error: Error) => void`

Sends error signal through the `Observable` instance. Errors can be received, with `.subscribe` method.

---
### complete
`() => void`

Sends `complete` signal through the `Observable` instance. Completion can be handled, with `.subscribe` method.

## Operators - common

---
### map
`(action: (value: T) => U): Observable<U>`

Creates a derivative stream of values where
every value pushed by a parent is transformed with `action` function and push further by `Observable` -
result of this function call.

---
### filter
`(filter: (value: T) => boolean): Observable<T>;`

Creates a derivative stream of values where
only those values that meet requirements formulated
with `filter` function are going to be pushed by that derivative `Observable`.

---
### scan
`(accumulator: (summary: U, value: T, index: number) => U, defaultValue?: U): Observable<U>`

Creates a derivative stream of values where
on every value that parent pushes
there is `accumulator` function called
getting last pushed value and new value that has been pushed by parent `Observable`.
Result of the function is next value of newly created `Observable`.
First call is with summary being undefined unless `defautValue` is also passed.

---
### flatten
`(): Observable<U>`

When parent `Observable` is releasing other `Observable`s as values
use `flatten` to create a derivative stream that consists only of values
that are released by these "observable values".

---
### merge
`(...args: Observable<T>;[]): Observable<T>;

Creates a stream containing all values of parent and of provided in arguments streams.

---
### distinct
`(comparator?: (prev: T, next: T) => boolean): Observable<T>;`

Creates a derivative stream of values
but eliminates repeated subsequent value occurences.

If `comparator` is passed, it is going to be used
to determine if a value is distinct from previous one.
Otherwise strict equal is incorporated.

---
### buffer
`(maxLastValues: number = 0): Observable<T[]>`

Creates a derivative stream of parent `Observable` values gathered in array.
New values set is released after
all other `Observable`s values are pushed through
and all `Domain` actions being called.
You can specify how many of there messages has to be remembered.

---
### materialize
`(defaultState: T): Atom<T>`

Creates a derivative stream with an `Atom` where all values pushed by source are pushed by this node too.
Resulting `Atom` will start with `defaultState` state value.

```javascript
async function example() {
    const a = new Observable().materialize(1)
    await leThreeHoursLater()
    console.log(a.deref()) // logs '1'
}
```

## Operators - specific

---
### startWith
`(firstValue: T): Observable<T>;`

Creates a derivative stream of values where
it has all values of parent stream, but these are preceeded
with `firstValue` that is immediately shared with all other nodes
that subscribed to the newly created stream.

---
### bufferCount
`(bufferSize: number, customBufferCount: number = null): Observable<T[]>`

Creates a derivative stream containing parent `Observable` values
gathered in an Array.
New values set is released
every `bufferSize`-th parent `Observable` value or
every `customBufferCount`-th parent `Observable` value
if second argument is present.

As it might be still mysterious how it works
consider these graphical representations
of how values are pushed in time:

```
const a = Observable.of(1, 2, 3, 4, 5)
const b = a.bufferCount(2)

a --1--2--3--4--5--|
b -----[1,2]-[3,4]-[5]|
```

```
const a = Observable.of(1, 2, 3, 4, 5)
const b = a.bufferCount(3, 2) // now with custom window

a --1--2--3-------4--5-|
b --------[1,2,3]----[3,4,5]-|
```

---
### reemit
`(): Observable<T>`

Creates a derivative stream where all values pushed by source are pushed by this node too,
but also this new one will push at first last value that has been emited by the source,
if that is available.

```javascript
async function example() {
    const a = new Observable().startWith(1)
    await leThreeHoursLater()
    const b = a.reemit()
    b.subscribe(value => console.log(value)) // logs '1'
}
```
