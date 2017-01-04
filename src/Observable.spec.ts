import { Observable } from './Observable'

const impossibru = function (done, msg): () => void {
    return (): void => {
        expect(`${msg} WILL NOT HAPPEN`).toBe(''); setTimeout(done)
    }
}

describe('Observable', () => {
    it('can be created with array', done => {
        const pushValues = [1, 2, 3]
        const expectedValues = [...pushValues]
        let result = []
        Observable.from([1, 2, 3]).subscribe(
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
        let result = []
        Observable.from(Observable.from([1, 2, 3])).subscribe(
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
        let result = []
        Observable.of(1, 2, 3).subscribe(
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
        const tester = value => {
            expect(value).toBe(3)
            setTimeout(done)
        }
        Observable.of(1, 2, 3).filter(value =>
            value > 2
        ).subscribe(value => {
            tester(value)
        }, impossibru(done, 'Error sub trigger'), impossibru(done, 'Completion sub trigger'))
    })

    it('can reduce messages', done => {
        const tester = value => {
            expect(value).toBe(6)
            setTimeout(done)
        }
        Observable.of(1, 2, 3).reduce((acc, value) =>
            acc + value
        ).subscribe(value => {
            tester(value)
        }, impossibru(done, 'Error sub trigger'), impossibru(done, 'Completion sub trigger'))
    })

    it('can map messages', () => {
        let next = null
        const values = []

        const subscription = new Observable(observer => {
            next = v => observer.next(v)
        }).map(
            v => v * 5
        ).subscribe(v => { values.push(v) })

        next(1)
        expect(values).toEqual([5])
        next(2)
        expect(values).toEqual([5, 10])
        next(3)
        expect(values).toEqual([5, 10, 15])
    })
})
