import { Observable } from './Observable'
import { Merge } from './Merge'

describe('Merge', () => {
    it('can be created with observables', done => {
        const subject = new Merge<{ o1: string, o2: string, o3: string }>({
            o1: new Observable(observer => { observer.next('o1') }),
            o2: new Observable(observer => { observer.next('o2') }),
            o3: new Observable(observer => { observer.next('o3') }),
        })
        subject.subscribe(merged => {
            expect(merged).toEqual({
                o1: 'o1',
                o2: 'o2',
                o3: 'o3',
            })
            setTimeout(done)
        })
    })
    it('listens to changes', done => {
        let push = null
        const source = new Observable(observer => {
            push = observer.next
            push(1)
        })
        const subject = new Merge<{ source: number }>({ source })
        const values = []
        subject.subscribe(merged => {
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
