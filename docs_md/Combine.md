# class Combine`<T>` extends [Atom](./Atom)`<T>`
`new ({ [name: string]: Observable|Atom|Domain })`

Responsible for being reactive to more than one source and placing source streams contents in their respective (according to informations provided upon initialization) field in result object.

```javascript
new Combine({
    a: new Atom('a'),
	b: new Atom('b'),
    c: new Observable(observer => { observer.next('c') })
})
    .subscribe(v => {
        console.log(v)
            // { a: 'a', b: 'b', c: null }
            // { a: 'a', b: 'b', c: 'c' }
    })
```
