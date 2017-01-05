import { dispatch } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
const { TEST } = DispatcherPriorities

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
            Domain.create(new Observable(), { test: () => { } })
        }).not.toThrow()
    })

    it('allows calling actions', done => {
        let tested = false
        const TheDomain = Domain.create(
            new Observable(),
            { test() { tested = true } }
        )
        TheDomain.test()
        dispatch(() => {
            expect({ tested }).toEqual({ tested: true })
            setTimeout(done)
        }, TEST)
    })

    it('action calls return Promises of execution', done => {
        let tested = false
        const TheDomain = Domain.create(
            new Observable(),
            {
                test() {
                    tested = true
                    return Promise.resolve()
                }
            }
        )
        TheDomain.test().then(result => {
            expect(result).toBe(undefined)
            expect({ tested }).toEqual({ tested: true })
            setTimeout(done)
        })
    })

    it('shares same data as provided observable', done => {
        const pushingValues = [1, 2, 3]
        const expectedValues = [...pushingValues]
        const values = []
        new Domain(Observable.from(pushingValues)).subscribe(v => {
            values.push(v)
            expect(v).toBe(expectedValues.shift())
            if (values.length === 3) setTimeout(done)
        })
    })
})
