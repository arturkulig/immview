import { Atom } from './Atom'
import { DispatcherPriorities } from './DispatcherPriorities'
import { dispatch, flush } from './DispatcherInstance'
const { ALL } = DispatcherPriorities

const fail = function (done, msg): () => void {
    return (): void => {
        expect(`${msg} WILL NOT HAPPEN`).toBe('')
        setTimeout(done)
    }
}

describe('Atom', () => {
    describe('.from', () => {
        it('can be created with array', done => {
            const pushValues = [1, 2, 3]
            const expectedValues = [...pushValues]
            const result = []
            const subject = new Atom(pushValues[0])
            subject.subscribe(
                value => {
                    result.push(value)
                    expect(value).toBe(expectedValues.shift())
                    if (result.length === 3) {
                        setTimeout(done)
                    }
                }
            )
            pushValues.slice(1).forEach(v => subject.next(v))
        })

        it('can be created from other Atom', done => {
            const pushValues = [1, 2, 3]
            const expectedValues = [...pushValues]
            const result = []
            const subject = new Atom(pushValues[0])
            Atom.from(subject).subscribe(
                value => {
                    result.push(value)
                    expect(value).toBe(expectedValues.shift())
                    if (result.length === 3) {
                        setTimeout(done)
                    }
                }
            )
            pushValues.slice(1).forEach(v => subject.next(v))
        })

        it('can be create listing future values', done => {
            const pushValues = [1, 2, 3]
            const expectedValues = [...pushValues]
            const result = []
            const subject = new Atom(pushValues[0])
            subject.subscribe(value => { result.push(value) })
            pushValues.slice(1).forEach(v => subject.next(v))
            dispatch(() => {
                expect(result).toEqual(expectedValues)
                done()
            }, ALL)
        })
    })

    it('.of - can release a promise of next value', async () => {
        const val = await Atom.of(1).toPromise()
        expect(val).toBe(1)
    })

    it('::filter can filter messages', done => {
        const pushValues = [1, 2, 3]
        const expectedValues = [1, 3]
        const result = []
        const subject = new Atom(pushValues[0])
        subject
            .filter(value => value > 2)
            .subscribe(value => { result.push(value) })
        pushValues.slice(1).forEach(v => subject.next(v))
        setTimeout(() => {
            expect(result).toEqual(expectedValues)
            setTimeout(done)
        })
    })

    describe('::scan - can scan messages, and reduce output', () => {
        it('without default value', done => {
            const pushValues = [1, 2, 3]
            const expectedValues = [2, 6, 12]
            const result = []
            const subject = new Atom(pushValues[0])
            subject.scan(
                (summary: number, value) => (summary | 0) + value * 2
            ).subscribe(value => {
                result.push(value)
                expect(value).toBe(expectedValues.shift())
                if (result.length === 3) {
                    setTimeout(done)
                }
            })
            pushValues.slice(1).forEach(v => subject.next(v))
        })
        it('with a default value', done => {
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
                if (result.length === 3) {
                    setTimeout(done)
                }
            })
            pushValues.slice(1).forEach(v => subject.next(v))
        })
    })

    it('::map - can map messages', done => {
        const pushValues = [1, 2, 3]
        const expectedValues = [5, 10, 15]
        const result = []
        const subject = new Atom(pushValues[0])
        subject.map(v =>
            v * 5
        ).subscribe(value => {
            result.push(value)
            expect(value).toBe(expectedValues.shift())
            if (result.length === 3) {
                setTimeout(done)
            }
        })
        pushValues.slice(1).forEach(v => subject.next(v))
    })

    describe('::buffer - can create sliding buffer', () => {
        it('without specified window length', done => {
            const pushValues = [1, 2, 3]
            const expectedValues = [[1], [2, 3]]
            const result = []
            const subject = new Atom(pushValues[0])
            subject.buffer().subscribe(
                value => { result.push(value) }
            )
            dispatch(() => {
                pushValues.slice(1).forEach(v => subject.next(v))
            }, ALL)
            setTimeout(() => {
                expect(result).toEqual(expectedValues)
                setTimeout(done)
            }, 10)
        })
        it('with window length 1', done => {
            const pushValues = [1, 2, 3]
            const expectedValues = [[1], [3]]
            const result = []
            const subject = new Atom(pushValues[0])
            subject.buffer(1).subscribe(
                value => { result.push(value) }
            )
            dispatch(() => {
                pushValues.slice(1).forEach(v => subject.next(v))
            }, ALL)
            setTimeout(() => {
                expect(result).toEqual(expectedValues)
                setTimeout(done)
            }, 10)
        })

        it('with window length 2', done => {
            const pushValues = [1, 2, 3, 4]
            const expectedValues = [[1], [3, 4]]
            const result = []
            const subject = new Atom(pushValues[0])
            subject.buffer(2).subscribe(
                value => { result.push(value) }
            )
            dispatch(() => {
                pushValues.slice(1).forEach(v => subject.next(v))
            }, ALL)
            setTimeout(() => {
                expect(result).toEqual(expectedValues)
                setTimeout(done)
            }, 10)
        })

        it('with window length 3', done => {
            const pushValues = [1, 2, 3, 4]
            const expectedValues = [[1], [2, 3, 4]]
            const result = []
            const subject = new Atom(pushValues[0])
            subject.buffer(3).subscribe(
                value => { result.push(value) }
            )
            dispatch(() => {
                pushValues.slice(1).forEach(v => subject.next(v))
            }, ALL)
            setTimeout(() => {
                expect(result).toEqual(expectedValues)
                setTimeout(done)
            }, 10)
        })

        it('with window length longer than stream', done => {
            const pushValues = [1, 2, 3, 4]
            const expectedValues = [[1], [2, 3, 4]]
            const result = []
            const subject = new Atom(pushValues[0])
            subject.buffer(4).subscribe(
                value => { result.push(value) }
            )
            dispatch(() => {
                pushValues.slice(1).forEach(v => subject.next(v))
                subject.complete()
            }, ALL)
            setTimeout(() => {
                expect(result).toEqual(expectedValues)
                setTimeout(done)
            }, 10)
        })
    })

    it('::flatten - can flatten Atom values', done => {
        const pushValues = [1, 2, 3]
        const expectedValues = [...pushValues]
        const result = []
        const inner = new Atom(pushValues[0])
        new Atom<Atom<number>>(inner)
            .flatten()
            .subscribe(v => { result.push(v) })
        pushValues.slice(1).forEach(v => inner.next(v))
        dispatch(() => {
            expect(result).toEqual(expectedValues)
            setTimeout(done)
        }, ALL)
    })

    describe('::merge - can merge', () => {
        describe('two streams', () => {
            it('none ends', done => {
                const a = new Atom(1)
                const b = new Atom(2)
                const c = a.merge(b)
                const values = []
                c.subscribe(value => { values.push(value) }, fail('error', done), fail('completion', done))
                dispatch(() => {
                    expect(values).toEqual([2])
                    setTimeout(done)
                }, ALL)
            })
            it('one ends', done => {
                const a = new Atom(1)
                const b = new Atom(2)
                const c = a.merge(b)
                const values = []
                c.subscribe(value => { values.push(value) }, fail('error', done), fail('completion', done))
                a.complete()
                dispatch(() => {
                    expect(values).toEqual([2])
                    setTimeout(done)
                }, ALL)
            })
            it('both ends', done => {
                const a = new Atom(1)
                const b = new Atom(2)
                const c = a.merge(b)
                const values = []
                c.subscribe(value => { values.push(value) }, fail('error', done), () => { values.push('complete') })
                b.next(3)
                a.complete()
                b.complete()
                dispatch(() => {
                    expect(values).toEqual([2, 3, 'complete'])
                    setTimeout(done)
                }, ALL)
            })
        })
        it('many streams', done => {
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
            subject.subscribe(v => values.push(v), fail('error', done), () => values.push('complete'))
            others.forEach(o => o.next(o.deref()))
            all.forEach(o => o.complete())
            dispatch(() => {
                expect(values).toEqual([5, 2, 3, 4, 5, 'complete'])
                setTimeout(done)
            }, ALL)
        })
    })

    describe('::distinct - creates a stream with only distinct values', () => {
        it('without a comparator', done => {
            const ref = {}
            const pushValues = [1, 2, 2, 3, ref, ref, 1]
            const values = []
            const subject = new Atom(pushValues[0])
            subject.distinct().subscribe(v => { values.push(v) })
            pushValues.forEach(v => subject.next(v))
            dispatch(() => {
                expect(values).toEqual([1, 2, 3, ref, 1])
                setTimeout(done)
            }, ALL)
        })

        it('with a comparator', done => {
            const ref = {}
            const pushValues = [1, 2, 2, 3, ref, ref, 1]
            const values = []
            const subject = new Atom(pushValues[0])
            subject
                .distinct((prev, next) => (typeof prev !== typeof next))
                .subscribe(v => { values.push(v) })
            pushValues.slice(1).forEach(v => subject.next(v))
            dispatch(() => {
                expect(values).toEqual([1, ref, 1])
                setTimeout(done)
            }, ALL)
        })
    })
})
