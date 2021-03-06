import { Observable } from './Observable'
import { Atom } from './Atom'
import { Combine } from './Combine'
import { flush } from './DispatcherInstance'

describe('Combine', () => {
    it('can be created with observables', async () => {
        const expectedValues = [
            { o1: null, o2: null, o3: null },
            { o1: 'o1', o2: null, o3: null },
            { o1: 'o1b', o2: null, o3: null },
            { o1: 'o1c', o2: null, o3: null },
            { o1: 'o1c', o2: 'o2', o3: null },
            { o1: 'o1c', o2: 'o2', o3: 'o3' },
            { o1: 'o1c', o2: 'o2b', o3: 'o3' },
            { o1: 'o1c', o2: 'o2c', o3: 'o3' },
        ]
        const received = []

        const o1 = new Observable<string>()
        const o2 = new Observable<string>()
        const o3 = new Observable<string>()

        new Combine<{ o1: string, o2: string, o3: string }>({ o1, o2, o3, })
            .subscribe(merged => {
                received.push(merged)
            })

        o1.next('o1')
        o1.next('o1b')
        o1.next('o1c')
        o2.next('o2')
        o3.next('o3')
        await new Promise(resolve => setTimeout(resolve))
        o2.next('o2b')
        o2.next('o2c')

        expect(received).toEqual(expectedValues)
    })

    it('can be created with atoms', async () => {
        const expectedValues = [
            { o1: 'start', o2: 'start', o3: 'start' },
            { o1: 'o1', o2: 'start', o3: 'start' },
            { o1: 'o1b', o2: 'start', o3: 'start' },
            { o1: 'o1b', o2: 'o2', o3: 'start' },
            { o1: 'o1b', o2: 'o2', o3: 'o3' },
            { o1: 'o1b', o2: 'o2b', o3: 'o3' },
            { o1: 'o1b', o2: 'o2c', o3: 'o3' },
        ]
        const received = []

        const o1 = new Atom<string>('start')
        const o2 = new Atom<string>('start')
        const o3 = new Atom<string>('start')

        new Combine<{ o1: string, o2: string, o3: string }>({ o1, o2, o3, })
            .subscribe(merged => {
                received.push(merged)
            })

        o1.next('o1')
        o1.next('o1b')
        o2.next('o2')
        o3.next('o3')
        await new Promise(resolve => setTimeout(resolve))
        o2.next('o2b')
        o2.next('o2c')

        expect(received).toEqual(expectedValues)
    })

    it('closes as first of sources closes', () => {
        const values = []
        const o1 = new Atom<string>('start')
        const o2 = new Atom<string>('start')
        const o3 = new Atom<string>('start')

        new Combine<{ o1: string, o2: string, o3: string }>({ o1, o2, o3, })
            .subscribe(v => values.push(v))

        o1.next('o1')
        o2.complete()
        o3.next('o3')

        expect(values).toEqual([
            { o1: 'start', o2: 'start', o3: 'start' },
            { o1: 'o1', o2: 'start', o3: 'start' },
        ])
    })
})
