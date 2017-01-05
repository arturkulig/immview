import { Observable } from './Observable'
import { Domain } from './Domain'

describe('Domain', () => {
    it('allows creation with constructor', () => {
        expect(() => {
            new Domain(new Observable())
        }).not.toThrow()
    })

    it('allows creation with actions', () => {
        expect(() => {
            Domain.create(new Observable(), { test() { } })
        }).not.toThrow()
    })

    it('allows calling actions', () => {
        let tested = false
        const TheDomain = Domain.create(
            new Observable(),
            { test() { tested = true } }
        )
        TheDomain.test()
        expect({ tested }).toEqual({ tested: true })
    })

    it('action calls return Promises of execution', done => {
        expect(() => {
            let tested = false
            const TheDomain = Domain.create(
                new Observable(),
                { test() { tested = true; return Promise.resolve() } }
            )
            TheDomain.test().then(result => {
                expect(result).toBe(undefined)
                expect({ tested }).toEqual({ tested: true })
                setTimeout(done)
            })
        }).not.toThrow()
    })

    it('shares same data as provided observable', () => {
        const values = []
        new Domain(Observable.of(1, 2, 3)).subscribe(v => values.push(v))
        expect(values).toEqual([1, 2, 3])
    })
})
