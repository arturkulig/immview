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
            new Domain(new Observable(), { test() { } })
        }).not.toThrow()
    })

    it('allows calling actions', () => {
        let tested = false
        const TheDomain = new Domain(
            new Observable(),
            { test() { tested = true } }
        )
        TheDomain.dispatch('test')
        expect({ tested }).toEqual({ tested: true })
    })

    it('action calls return Promises of execution', done => {
        expect(() => {
            let tested = false
            const TheDomain = new Domain(
                new Observable(),
                { test() { tested = true } }
            )
            TheDomain.dispatch('test').then(() => {
                expect({ tested }).toEqual({ tested: true })
                done()
            })
        }).not.toThrow()
    })
})
