import { Observable } from './Observable'

describe('Observable', () => {
    it('can be created with array', done => {
        const pushValues = [1, 2, 3]
        const expectedValues = [...pushValues]
        const result = []
        Observable.from(pushValues).subscribe(
            value => {
                result.push(value)
                expect(value).toBe(expectedValues.shift())
                if (result.length === 3) {
                    setTimeout(done)
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
                    setTimeout(done)
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
                expect(value).toBe(expectedValues.shift())
                if (result.length === 3) {
                    setTimeout(done)
                }
            }
        )
    })

    it('can filter messages', done => {
        const pushValues = [1, 2, 3]
        Observable.from(pushValues).filter(value =>
            value > 2
        ).subscribe(value => {
            expect(value).toBe(3)
            setTimeout(done)
        })
    })

    it('can scan messages, and reduce output', done => {
        const pushValues = [1, 2, 3]
        const expectedValues = [2, 6, 12]
        const result = []
        Observable.from(pushValues).scan(
            (summary: number, value) => (summary | 0) + value * 2
        ).subscribe(value => {
            result.push(value)
            expect(value).toBe(expectedValues.shift())
            if (result.length === 3) {
                setTimeout(done)
            }
        })
    })

    it('can map messages', done => {
        const pushValues = [1, 2, 3]
        const expectedValues = [5, 10, 15]
        const result = []
        Observable.from(pushValues).map(v =>
            v * 5
        ).subscribe(value => {
            result.push(value)
            expect(value).toBe(expectedValues.shift())
            if (result.length === 3) {
                setTimeout(done)
            }
        })
    })

    describe('can create sliding buffer', () => {
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
                done()
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
                done()
            }, 10)
        })

        it('with window length 2', done => {
            const pushValues = [1, 2, 3]
            const expectedValues = [[2, 3]]
            const result = []
            Observable.from(pushValues).buffer(2).subscribe(
                value => {
                    result.push(value)
                }
            )
            setTimeout(() => {
                expect(result).toEqual(expectedValues)
                done()
            }, 10)
        })

        it('with window length 3', done => {
            const pushValues = [1, 2, 3]
            const expectedValues = [[1, 2, 3]]
            const result = []
            Observable.from(pushValues).buffer(3).subscribe(
                value => {
                    result.push(value)
                }
            )
            setTimeout(() => {
                expect(result).toEqual(expectedValues)
                done()
            }, 10)
        })

        it('with window length longer than stream', done => {
            const pushValues = [1, 2, 3]
            const expectedValues = [[1, 2, 3]]
            const result = []
            Observable.from(pushValues).buffer(4).subscribe(
                value => {
                    result.push(value)
                }
            )
            setTimeout(() => {
                expect(result).toEqual(expectedValues)
                done()
            }, 10)
        })
    })

    it('can flatten observable values', done => {
        const pushValues = [1, 2, 3]
        const expectedValues = [...pushValues]
        const result = []
        new Observable<Observable<number>>(observer => {
            observer.next(Observable.from(pushValues))
        }).flatten().subscribe(v => {
            result.push(v)
        })
        setTimeout(() => {
            expect(result).toEqual(expectedValues)
            done()
        })
    })

    it('can take buffered messages with default interval', done => {
        const pushValues = [1, 2, 3, 4]
        const expectedValues = [[1, 2], [3, 4]]
        let result = []
        Observable.from(pushValues).bufferCount(2).subscribe(
            value => {
                result.push(value)
                expect(value).toEqual(expectedValues.shift())
                if (result.length === 2) {
                    setTimeout(done)
                }
            }
        )
    })

    it('can take buffered messages with set interval', done => {
        const pushValues = [1, 2, 3, 4]
        const expectedValues = [[1, 2, 3], [2, 3, 4]]
        let result = []
        Observable.from(pushValues).bufferCount(3, 1).subscribe(
            value => {
                result.push(value)
                expect(value).toEqual(expectedValues.shift())
                if (result.length === 2) {
                    setTimeout(done)
                }
            }
        )
    })

    it('should emit partial buffers if reaches end', done => {
        const pushValues = [1, 2, 3]
        const expectedValues = [[1, 2, 3]]
        let result = []
        Observable.from(pushValues).bufferCount(4).subscribe(
            value => {
                result.push(value)
                expect(value).toEqual(expectedValues.shift())
                if (result.length === 1) {
                    setTimeout(done)
                }
            }
        )
    })

    it('should emit full buffers then partial buffer if reaches end', done => {
        const pushValues = [1, 2, 3, 4]
        const expectedValues = [[1, 2, 3], [4]]
        let result = []
        Observable.from(pushValues).bufferCount(3).subscribe(
            value => {
                result.push(value)
                expect(value).toEqual(expectedValues.shift())
                if (result.length === 2) {
                    setTimeout(done)
                }
            }
        )
    })

    it('should emit full buffers then partial buffer with old values if reaches end', done => {
        const pushValues = [1, 2, 3, 4]
        const expectedValues = [[1, 2, 3], [3, 4]]
        let result = []
        Observable.from(pushValues).bufferCount(3, 2).subscribe(
            value => {
                result.push(value)
                expect(value).toEqual(expectedValues.shift())
                if (result.length === 2) {
                    setTimeout(done)
                }
            }
        )
    })
})
