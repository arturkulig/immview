import { Observable } from './Observable'

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
        Observable.of(1, 2, 3).filter(value =>
            value > 2
        ).subscribe(value => {
            expect(value).toBe(3)
            setTimeout(done)
        })
    })

    it('can reduce messages', done => {
        const pushValues = [1, 2, 3]
        const expectedValues = [1, 3, 6]
        let result = []
        Observable.of(1, 2, 3).reduce((value, summary : number) =>
            summary + value
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
        let result = []
        Observable.of(1, 2, 3).map(v =>
            v * 5
        ).subscribe(value => {
            result.push(value)
            expect(value).toBe(expectedValues.shift())
            if (result.length === 3) {
                setTimeout(done)
            }
        })
    })
})
