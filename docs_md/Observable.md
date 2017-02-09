# class `Observable<T>`

`(subscriber: (observer: {next: (value: T) => void, error: (err: Error) => void, complete: () => void}) => void | () => void)`

Construct with `subscriber` function that receives `observer` object. `Observer` is for pushing values, errors and completion signal.

`Subscriber` function may return function that should be called if `Observable` receives `complete` signal or is cancelled.

---
## Observable.*of*
`(...args: T[]): Observable<T>;`

Function to create an `Observable` that immediately pushes values given as arguments.

**Stream is immediately completed after all values are pushed.**
If you wish to create a stream and kickstart it with a value(s), use `startWith`.

---
## Observable.*from*
`(values: T[]): Observable<T>;`

Function to create an `Observable` that immediately pushes values given as an array of values.

**Stream is immediately completed after all values are pushed.**
If you wish to create a stream and kickstart it with a value(s), use `startWith`.

---
## Observable.prototype.*previous*
`() => T`

Returns previous **value** that has been pushed through the `Observable` instance.

```javascript
// Example
const source = new Observable(({next}) => { next(1) })
source.subscribe(value => {
    value === source.previous() // true
})
```

---
## Observable.prototype.*toPromise*
`() => T`

Returns next **value** that's going to be pushed through the `Observable` instance.

```javascript
// Example
const source = new Observable()
setTimeout(() => source.next(1), 100)
const value = await source.toPromise()
```

---
## Observable.prototype.*next*
`(nextValue: T) => void`

Sends value signal through the `Observable` instance. Values can be received, by `Observable.prototype.subscribe` method or `Observable.prototype.previous`.

---
## Observable.prototype.*error*
`(error: Error) => void`

Sends error signal through the `Observable` instance. Errors can be received, with `Observable.prototype.subscribe` method.

---
## Observable.prototype.*complete*
`() => void`

Sends `complete` signal through the `Observable` instance. Completion can be handled, with `Observable.prototype.subscribe` method.

---
## Observable.prototype.*subscribe*
`( { start: (sub: Subscription) => void, next: (value: T) => void, error: (err: Error) => void, complete: () => void } ) => { unsubscribe(): void }`

`( onNext?: (value: T) => void, onError?: (err: Error) => void, onCompletion?: () => void ) => { unsubscribe(): void }`

Registers a function called every time when the Observable changes value that it holds, error is pushed or Observable is complete.

Returns a function to unregister the subscription.

---
## Observable.prototype.*map*
`(action: (value: T) => U): Observable<U>`

Creates a derivative stream of values where
every value pushed by a parent is transformed with `action` function and push further by `Observable` -
result of this function call.

---
## Observable.prototype.*startWith*
`(firstValue: T): Observable<T>;`

Creates a derivative stream of values where
it has all values of parent stream, but these are preceeded
with `firstValue` that is immediately shared with all other nodes
that subscribed to the newly created stream.

---
## Observable.prototype.*filter*
`(filter: (value: T) => boolean): Observable<T>;`

Creates a derivative stream of values where
only those values that meet requirements formulated
with `filter` function are going to be pushed by that derivative `Observable`.

---
## Observable.prototype.*scan*
`(accumulator: (summary: U, value: T, index: number) => U, defaultValue?: U): Observable<U>`

Creates a derivative stream of values where
on every value that parent pushes
there is `accumulator` function called
getting last pushed value and new value that has been pushed by parent `Observable`.
Result of the function is next value of newly created `Observable`.
First call is with summary being undefined unless `defautValue` is also passed.

---
## Observable.prototype.*flatten*
`(): Observable<U>`

When parent `Observable` is releasing other `Observable`s as values
use `flatten` to create a derivative stream that consists only of values
that are released by these "observable values".

---
## Observable.prototype.*merge*
`(...args: Observable<T>;[]): Observable<T>;

Creates a stream containing all values of parent and of provided in arguments streams.

---
## Observable.prototype.*distinct*
`(comparator?: (prev: T, next: T) => boolean): Observable<T>;`

Creates a derivative stream of values
but eliminates repeated subsequent value occurences.

If `comparator` is passed, it is going to be used
to determine if a value is distinct from previous one.
Otherwise strict equal is incorporated.

---
## Observable.prototype.*buffer*
`(maxLastValues: number = 0): Observable<T[]>`

Creates a derivative stream of parent `Observable` values gathered in array.
New values set is released after
all other `Observable`s values are pushed through
and all `Domain` actions being called.
You can specify how many of there messages has to be remembered.

---
## Observable.prototype.*bufferCount*
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
## Observable.prototype.*reemit*
`(): Observable<T>`

Creates a derivative stream where all values pushed by source are pushed by this node too,
but also this new one will push at first last value that has been pushed by source in the past,
if any was actually pushed.

```javascript
async function example() {
    const a = new Observable().startWith(1)
    await leThreeHoursLater()
    const b = a.reemit()
    console.log(await b.toPromise()) // logs '1'
}
```
