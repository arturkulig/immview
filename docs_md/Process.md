# class `Process<T>`

`Process` is a wrapper for a asynchronous function that
receives observable that is a message box of that process.

`Process` instance is an observer, so might be used directly as subscriber.

```javascript
const proc = new Process(
    async mb => {
        for await (let msg of mb) {
            console.log(msg)
        }
    }
)
proc.next(1) // logs 1
proc.next(2) // logs 2

Observable.of(3, 4).subscribe(mb) // logs 3, then 4, then completes
```
