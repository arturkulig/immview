import { Atom } from './Atom'
import { DispatcherPriorities } from './DispatcherPriorities'
import { dispatch, flush } from './DispatcherInstance'
const { ALL } = DispatcherPriorities

const fail = function (msg?: string): () => void {
    return (): void => {
        expect(`${msg} WILL NOT HAPPEN`).toBe('')
    }
}

describe('Atom', () => {
    describe('.from', () => {
        it('can be created with array', () => {
            const pushValues = [1, 2, 3]
            const expectedValues = [...pushValues]
            const result = []
            const subject = new Atom(pushValues[0])
            subject.subscribe(
                value => {
                    result.push(value)
                    expect(value).toBe(expectedValues.shift())
                }
            )
            pushValues.slice(1).forEach(v => subject.next(v))
            expect(result.length).toBe(3)
        })

        it('can be created from other Atom', () => {
            const pushValues = [1, 2, 3]
            const expectedValues = [...pushValues]
            const result = []
            const subject = new Atom(pushValues[0])
            Atom.from(subject).subscribe(
                value => {
                    result.push(value)
                    expect(value).toBe(expectedValues.shift())
                }
            )
            pushValues.slice(1).forEach(v => subject.next(v))
            expect(result.length).toBe(3)
        })

        it('can be create listing future values', () => {
            const pushValues = [1, 2, 3]
            const expectedValues = [...pushValues]
            const result = []
            const subject = new Atom(pushValues[0])
            subject.subscribe(value => { result.push(value) })
            pushValues.slice(1).forEach(v => subject.next(v))
            expect(result).toEqual(expectedValues)
        })
    })

    it('.of - can release a promise of next value', async () => {
        const val = await Atom.of(1).toPromise()
        expect(val).toBe(1)
    })

    it('::filter can filter messages', () => {
        const pushValues = [1, 2, 3]
        const expectedValues = [1, 3]
        const result = []
        const subject = new Atom(pushValues[0])
        subject
            .filter(value => value > 2)
            .subscribe(value => { result.push(value) })
        pushValues.slice(1).forEach(v => subject.next(v))
        expect(result).toEqual(expectedValues)
    })

    describe('::scan - can scan messages, and reduce output', () => {
        it('without default value', () => {
            const pushValues = [1, 2, 3]
            const expectedValues = [2, 6, 12]
            const result = []
            const subject = new Atom(pushValues[0])
            subject.scan(
                (summary: number, value) => (summary | 0) + value * 2
            ).subscribe(value => {
                result.push(value)
                expect(value).toBe(expectedValues.shift())
            })
            pushValues.slice(1).forEach(v => subject.next(v))
            expect(result.length).toBe(3)
        })
        it('with a default value', () => {
            const pushValues = [1, 2, 3]
            const expectedValues = [5, 9, 15]
            const result = []
            const subject = new Atom(pushValues[0])
            subject.scan(
                (summary: number, value) => summary + value * 2,
                3
            ).subscribe(value => {
                result.push(value)
                expect(value).toBe(expectedValues.shift())
            })
            pushValues.slice(1).forEach(v => subject.next(v))
            expect(result.length).toBe(3)
        })
    })

    it('::map - can map messages', () => {
        const pushValues = [1, 2, 3]
        const calculated = []
        const expectedValues = [5, 10, 15]
        const result = []
        const subject = new Atom(pushValues[0])
        subject
            .map(v => (
                calculated.push(v),
                v * 5
            ))
            .subscribe(value => {
                result.push(value)
            })
        pushValues.slice(1).forEach(v => subject.next(v))
        subject.complete()
        subject.next(null)
        expect({ result }).toEqual({ result: expectedValues })
        expect({ calculated }).toEqual({ calculated: [1, 2, 3] })
    })

    describe('::buffer - can create sliding buffer', () => {
        it('without specified window length', () => {
            const pushValues = [1, 2, 3]
            const expectedValues = [[1], [2, 3]]
            const result = []
            const subject = new Atom(pushValues[0])
            subject.buffer().subscribe(
                value => { result.push(value) }
            )
            dispatch(() => {
                for (let v of pushValues.slice(1)) { subject.next(v) }
            }, ALL)
            expect(result).toEqual(expectedValues)
        })
        it('with window length 1', () => {
            const pushValues = [1, 2, 3]
            const expectedValues = [[1], [3]]
            const result = []
            const subject = new Atom(pushValues[0])
            subject.buffer(1).subscribe(
                value => { result.push(value) }
            )
            dispatch(() => {
                for (let v of pushValues.slice(1)) { subject.next(v) }
            }, ALL)
            expect(result).toEqual(expectedValues)
        })

        it('with window length 2', () => {
            const pushValues = [1, 2, 3, 4]
            const expectedValues = [[1], [3, 4]]
            const result = []
            const subject = new Atom(pushValues[0])
            subject.buffer(2).subscribe(
                value => { result.push(value) }
            )
            dispatch(() => {
                for (let v of pushValues.slice(1)) { subject.next(v) }
            }, ALL)
            expect(result).toEqual(expectedValues)
        })

        it('with window length 3', () => {
            const pushValues = [1, 2, 3, 4]
            const expectedValues = [[1], [2, 3, 4]]
            const result = []
            const subject = new Atom(pushValues[0])
            subject.buffer(3).subscribe(
                value => { result.push(value) }
            )
            dispatch(() => {
                for (let v of pushValues.slice(1)) { subject.next(v) }
            }, ALL)
            expect(result).toEqual(expectedValues)
        })

        it('with window length longer than stream', () => {
            const pushValues = [1, 2, 3, 4]
            const expectedValues = [[1], [2, 3, 4]]
            const result = []
            const subject = new Atom(pushValues[0])
            subject.buffer(4).subscribe(
                value => { result.push(value) }
            )
            dispatch(() => {
                for (let v of pushValues.slice(1)) { subject.next(v) }
                subject.complete()
            }, ALL)
            expect(result).toEqual(expectedValues)
        })
    })

    it('::flatten - can flatten Atom values', () => {
        const pushValues = [1, 2, 3]
        const expectedValues = [...pushValues]
        const result = []
        const inner = new Atom(pushValues[0])
        new Atom<Atom<number>>(inner)
            .flatten()
            .subscribe(v => { result.push(v) })
        pushValues.slice(1).forEach(v => inner.next(v))
        expect(result).toEqual(expectedValues)
    })

    describe('::merge - can merge', () => {
        describe('two streams', () => {
            it('none ends', () => {
                const a = new Atom(1)
                const b = new Atom(2)
                const c = a.merge(b)
                const values = []
                c.subscribe(value => { values.push(value) }, fail('error'), fail('completion'))
                expect(values).toEqual([2])
            })
            it('one ends', () => {
                const a = new Atom(1)
                const b = new Atom(2)
                const c = a.merge(b)
                const values = []
                c.subscribe(value => { values.push(value) }, fail('error'), fail('completion'))
                a.complete()
                expect(values).toEqual([2])
            })
            it('both ends', () => {
                const a = new Atom(1)
                const b = new Atom(2)
                const c = a.merge(b)
                const values = []
                c.subscribe(value => { values.push(value) }, fail('error'), () => { values.push('complete') })
                b.next(3)
                a.complete()
                b.complete()
                expect(values).toEqual([2, 3, 'complete'])
            })
        })
        it('many streams', () => {
            const values = []
            const others = [
                new Atom(2),
                new Atom(3),
                new Atom(4),
                new Atom(5),
            ]
            const starter = new Atom(1)
            const all = [starter, ...others]
            const subject = starter.merge(...others)
            subject.subscribe(v => values.push(v), fail('error'), () => values.push('complete'))
            others.forEach(o => o.next(o.deref()))
            all.forEach(o => o.complete())
            expect(values).toEqual([5, 2, 3, 4, 5, 'complete'])
        })
    })

    describe('::distinct - creates a stream with only distinct values', () => {
        it('without a comparator', () => {
            const ref = {}
            const pushValues = [1, 2, 2, 3, ref, ref, 1]
            const values = []
            const subject = new Atom(pushValues[0])
            subject.distinct().subscribe(v => { values.push(v) })
            pushValues.forEach(v => subject.next(v))
            expect(values).toEqual([1, 2, 3, ref, 1])
        })

        it('with a comparator', () => {
            const ref = {}
            const pushValues = [1, 2, 2, 3, ref, ref, 1]
            const values = []
            const subject = new Atom(pushValues[0])
            subject
                .distinct((prev, next) => (typeof prev !== typeof next))
                .subscribe(v => { values.push(v) })
            pushValues.slice(1).forEach(v => subject.next(v))
            expect(values).toEqual([1, ref, 1])
        })
    })

    it('::materialize', () => {
        const former$ = new Atom(1)
        const latter$ = former$.materialize(0)
        expect(latter$.deref()).toBe(1)
        former$.next(2)
        expect(latter$.deref()).toBe(2)
    })

    it('::vaporize', async () => {
        const former$ = new Atom(1)
        const latter$ = former$.vaporize()
        expect(await latter$.toPromise()).toBe(1)
    })
})
