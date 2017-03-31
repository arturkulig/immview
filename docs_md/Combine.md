# class Combine`<T>` extends [Observable](./Observable)`<T>`
`( { [name: string]: Observable } ): Observable`

Responsible for being reactive to more than one source and placing source streams contents in their respective (according to informations provided upon initialization) field in result object.

```javascript
const join = new Combine({
    a: new Observable(observer => { observer.next('a') }),
	b: new Observable(observer => { observer.next('b') })
})
join.subscribe(v => {
    console.log(v) // {a: 'a', b: 'b'}
})
```