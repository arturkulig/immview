import { Observable } from './Observable'
import { Combine } from './Combine'

describe('Combine', () => {
    it('can be created with observables', done => {
        const expectedValues = [
            { o1: 'o1', o2: 'o2', o3: 'o3' },
            { o1: 'o1b', o2: 'o2', o3: 'o3' },
            { o1: 'o1b', o2: 'o2b', o3: 'o3' },
            { o1: 'o1b', o2: 'o2c', o3: 'o3' },
        ]
        const lastExpectedValue = expectedValues[expectedValues.length - 1]
        new Combine<{ o1: string, o2: string, o3: string }>({
            o1: new Observable<string>(observer => {
                observer.next('o1')
                observer.next('o1b')
            }),
            o2: new Observable<string>(observer => {
                observer.next('o2')
                setTimeout(() => {
                    observer.next('o2b')
                    observer.next('o2c')
                }, 100)
            }),
            o3: new Observable<string>(observer => {
                observer.next('o3')
            }),
        })
            .subscribe(merged => {
                expect(merged).toEqual(expectedValues.shift())
                try {
                    expect(merged).toEqual(lastExpectedValue)
                    setTimeout(done)
                } catch (e) { }
            })
    })
    it('listens to changes', done => {
        let push = null
        const source = new Observable<number>(observer => {
            push = observer.next
            push(1)
        })
        const values = []
        new Combine<{ source: number }>({ source })
            .subscribe(merged => {
                values.push(merged.source)
                if (
                    values[0] === 1 &&
                    values[1] === 3
                ) {
                    setTimeout(done)
                }
            })
        setTimeout(() => {
            push(3)
        })
    })
})
