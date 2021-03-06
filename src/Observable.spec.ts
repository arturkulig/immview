import { Observable } from './Observable'
import { NO_VALUE } from './Types'
import { DispatcherPriorities } from './DispatcherPriorities'
import { dispatch, flush } from './DispatcherInstance'
const { ALL } = DispatcherPriorities

const fail = function (done, msg): () => void {
    return (): void => {
        expect(`${msg} WILL NOT HAPPEN`).toBe('')
        setTimeout(done, 0)
    }
}

describe('Observable', () => {
    describe('.from', () => {
        it('can be created with array', done => {
            const pushValues = [1, 2, 3]
            const expectedValues = [...pushValues]
            const result = []
            Observable.from(pushValues).subscribe(
                value => {
                    result.push(value)
                    expect(value).toBe(expectedValues.shift())
                    if (result.length === 3) {
                        setTimeout(done, 0)
                    }
                }
            )
        })

        it('can be created from other Observable', done => {
            const pushValues = [1, 2, 3]
            const expectedValues = [...pushValues]
            const result = []
            Observable.from(Observable.from(pushValues)).subscribe(
                value => {
                    result.push(value)
                    expect(value).toBe(expectedValues.shift())
                    if (result.length === 3) {
                        setTimeout(done, 0)
                    }
                }
            )
        })

        it('can be create listing future values', done => {
            const pushValues = [1, 2, 3]
            const expectedValues = [...pushValues]
            const result = []
            Observable.from(pushValues).subscribe(
                value => {
                    result.push(value)
                }
            )
            dispatch(() => {
                expect(result).toEqual(expectedValues)
                done()
            }, ALL)
        })
    })

    it('.of - can release a promise of next value', async () => {
        const val = await Observable.of(1).toPromise()
        expect(val).toBe(1)
    })

    it('.fromPromise - can create stream from a promise', async () => {
        expect(
            await Observable.fromPromise(Promise.resolve(6)).toPromise()
        ).toBe(6)
    })

    it('::startWith - can create a new stream with initial, immediately released  value', done => {
        const values = []
        Observable.of(2, 3).startWith(1).subscribe(v => {
            values.push(v)
        })
        dispatch(() => {
            expect(values).toEqual([1, 2, 3])
            done()
        }, ALL)
    })

    it('::filter can filter messages', done => {
        const pushValues = [1, 2, 3]
        Observable.from(pushValues).filter(value =>
            value > 2
        ).subscribe(value => {
            expect(value).toBe(3)
            setTimeout(done, 0)
        })
    })

    describe('::scan - can scan messages, and reduce output', () => {
        it('without default value', done => {
            const pushValues = [1, 2, 3]
            const expectedValues = [2, 6, 12]
            const result = []
            Observable.from(pushValues).scan(
                (summary: number, value) => (summary | 0) + value * 2
            ).subscribe(value => {
                result.push(value)
                expect(value).toBe(expectedValues.shift())
                if (result.length === 3) {
                    setTimeout(done, 0)
                }
            })
        })
        it('with a default value', done => {
            const pushValues = [1, 2, 3]
            const expectedValues = [5, 9, 15]
            const result = []
            Observable.from(pushValues).scan(
                (summary: number, value) => summary + value * 2,
                3
            ).subscribe(value => {
                result.push(value)
                expect(value).toBe(expectedValues.shift())
                if (result.length === 3) {
                    setTimeout(done, 0)
                }
            })
        })
    })

    it('::map - can map messages', done => {
        const pushValues = [1, 2, 3]
        const expectedValues = [5, 10, 15]
        const result = []
        Observable.from(pushValues).map(v =>
            v * 5
        ).subscribe(value => {
            result.push(value)
            expect(value).toBe(expectedValues.shift())
            if (result.length === 3) {
                setTimeout(done, 0)
            }
        })
    })

    describe('::buffer - can create sliding buffer', () => {
        it('without specified window length', done => {
            const pushValues = [1, 2, 3]
            const expectedValues = [[1, 2, 3]]
            const result = []
            Observable.from(pushValues).buffer().subscribe(
                value => {
                    result.push(value)
                }
            )
            setTimeout(() => {
                expect(result).toEqual(expectedValues)
                setTimeout(done, 0)
            }, 10)
        })
        it('with window length 1', done => {
            const pushValues = [1, 2, 3]
            const expectedValues = [[3]]
            const result = []
            Observable.from(pushValues).buffer(1).subscribe(
                value => {
                    result.push(value)
                }
            )
            setTimeout(() => {
                expect(result).toEqual(expectedValues)
                setTimeout(done, 0)
            }, 10)
        })

        it('with window length 2', done => {
            const pushValues = [1, 2, 3]
            const expectedValues = [[2, 3]]
            const result = []
            Observable.from(pushValues).buffer(2).subscribe(
                value => { result.push(value) }
            )
            setTimeout(() => {
                expect(result).toEqual(expectedValues)
                setTimeout(done, 0)
            }, 10)
        })

        it('with window length 3', done => {
            const pushValues = [1, 2, 3]
            const expectedValues = [[1, 2, 3]]
            const result = []
            Observable.from(pushValues).buffer(3).subscribe(
                value => { result.push(value) }
            )
            setTimeout(() => {
                expect(result).toEqual(expectedValues)
                setTimeout(done, 0)
            }, 10)
        })

        it('with window length longer than stream', done => {
            const pushValues = [1, 2, 3]
            const expectedValues = [[1, 2, 3]]
            const result = []
            Observable.from(pushValues).buffer(4).subscribe(
                value => { result.push(value) }
            )
            setTimeout(() => {
                expect(result).toEqual(expectedValues)
                setTimeout(done, 0)
            }, 10)
        })
    })

    it('::flatten - can flatten observable values', done => {
        const pushValues = [1, 2, 3]
        const expectedValues = [...pushValues]
        const result = []
        new Observable<Observable<number>>(observer => {
            observer.next(Observable.from(pushValues))
        }).flatten().subscribe(v => {
            result.push(v)
        })
        dispatch(() => {
            expect(result).toEqual(expectedValues)
            setTimeout(done, 0)
        }, ALL)
    })

    describe('::merge - can merge', () => {
        describe('two streams', () => {
            it('none ends', done => {
                const a = new Observable(observer => { observer.next(1) })
                const b = new Observable(observer => { observer.next(2) })
                const c = a.merge(b)
                const values = []
                c.subscribe(value => { values.push(value) }, fail('error', done), fail('completion', done))
                dispatch(() => {
                    expect(values).toEqual([1, 2])
                    setTimeout(done, 0)
                }, ALL)
            })
            it('one ends', done => {
                const a = new Observable(observer => {
                    observer.next(1)
                    observer.complete()
                })
                const b = new Observable(observer => { observer.next(2) })
                const c = a.merge(b)
                const values = []
                c.subscribe(value => { values.push(value) }, fail('error', done), fail('completion', done))
                dispatch(() => {
                    expect(values).toEqual([1, 2])
                    setTimeout(done, 0)
                }, ALL)
            })
            it('both ends', done => {
                const a = Observable.of(1)
                const b = Observable.of(2)
                const c = a.merge(b)
                const values = []
                c.subscribe(value => { values.push(value) }, fail('error', done), () => { values.push('complete') })
                dispatch(() => {
                    expect(values).toEqual([1, 2, 'complete'])
                    setTimeout(done, 0)
                }, ALL)
            })
        })
        it('many streams', done => {
            const subject = Observable.of(1).merge(
                Observable.of(2),
                Observable.of(3),
                Observable.of(4),
                Observable.of(5),
            )
            const values = []
            subject.subscribe(v => values.push(v), fail('error', done), () => values.push('complete'))
            dispatch(() => {
                expect(values).toEqual([1, 2, 3, 4, 5, 'complete'])
                setTimeout(done, 0)
            }, ALL)
        })
    })

    describe('::distinct - creates a stream with only distinct values', () => {
        it('without a comparator', done => {
            const values = []
            const ref = {}
            Observable.of<any>(1, 2, 2, 3, ref, ref, 1).distinct().subscribe(v => { values.push(v) })
            dispatch(() => {
                expect(values).toEqual([1, 2, 3, ref, 1])
                done()
            }, ALL)
        })

        it('with a comparator', done => {
            const values = []
            const compared = []
            const ref = {}
            Observable
                .of<any>(1, 2, 2, 3, ref, ref, 1)
                .distinct((prev, next) => (compared.push([prev, next]), typeof prev !== typeof next))
                .subscribe(v => { values.push(v) })
            dispatch(() => {
                try {
                    expect(values).toEqual([1, ref, 1])
                    expect(compared).toEqual([
                        [1, 2],
                        [1, 2],
                        [1, 3],
                        [1, ref],
                        [ref, ref],
                        [ref, 1]
                    ])
                    done()
                } catch (e) {
                    done.fail(e)
                }
            }, ALL)
        })
    })

    describe('::bufferCount', () => {
        it('can take buffered messages with default interval', done => {
            const pushValues = [1, 2, 3, 4]
            const expectedValues = [[1, 2], [3, 4]]
            const result = []
            Observable.from(pushValues).bufferCount(2).subscribe(
                value => {
                    result.push(value)
                    expect(value).toEqual(expectedValues.shift())
                    if (result.length === 2) {
                        setTimeout(done, 0)
                    }
                }
            )
        })

        it('can take buffered messages with set interval', done => {
            const pushValues = [1, 2, 3, 4]
            const expectedValues = [[1, 2, 3], [2, 3, 4]]
            const result = []
            Observable.from(pushValues).bufferCount(3, 1).subscribe(
                value => {
                    result.push(value)
                    expect(value).toEqual(expectedValues.shift())
                    if (result.length === 2) {
                        setTimeout(done, 0)
                    }
                }
            )
        })

        it('should emit partial buffers if reaches end', done => {
            const pushValues = [1, 2, 3]
            const expectedValues = [[1, 2, 3]]
            const result = []
            Observable.from(pushValues).bufferCount(4).subscribe(
                value => {
                    result.push(value)
                    expect(value).toEqual(expectedValues.shift())
                    if (result.length === 1) {
                        setTimeout(done, 0)
                    }
                }
            )
        })

        it('should emit full buffers then partial buffer if reaches end', done => {
            const pushValues = [1, 2, 3, 4]
            const expectedValues = [[1, 2, 3], [4]]
            const result = []
            Observable.from(pushValues).bufferCount(3).subscribe(
                value => {
                    result.push(value)
                    expect(value).toEqual(expectedValues.shift())
                    if (result.length === 2) {
                        setTimeout(done, 0)
                    }
                }
            )
        })

        it('should emit full buffers then partial buffer with old values if reaches end', done => {
            const pushValues = [1, 2, 3, 4]
            const expectedValues = [[1, 2, 3], [3, 4]]
            const result = []
            Observable.from(pushValues).bufferCount(3, 2).subscribe(
                value => {
                    result.push(value)
                    expect(value).toEqual(expectedValues.shift())
                    if (result.length === 2) {
                        setTimeout(done, 0)
                    }
                }
            )
        })
    })

    it('::reemit - should reemit last value', async () => {
        const a = new Observable().startWith(1)
        expect({ aHasRef: a.hasRef(), aRef: a.deref() }).toEqual({ aHasRef: false, aRef: null })
        const b = a.reemit()
        expect({ bHasRef: b.hasRef(), bRef: b.deref() }).toEqual({ bHasRef: false, bRef: null })

        expect(await b.toPromise()).toBe(1)

        const c = b.reemit()
        expect(await c.toPromise()).toBe(1)
    })

    it('::materialize', () => {
        const former$ = new Observable()
        const latter$ = former$.materialize(0)
        expect(latter$.deref()).toBe(0)
        former$.next(1)
        expect(latter$.deref()).toBe(1)
    })

    it('::vaporize', async () => {
        const former$ = new Observable()
        const latter$ = former$.vaporize()
        former$.next(1)
        expect(await latter$.toPromise()).toBe(1)
    })
})
