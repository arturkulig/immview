import { dispatch } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
const { TEST } = DispatcherPriorities

import { Observable } from './Observable'
import { Domain } from './Domain'

describe('Domain', () => {
    describe('allows creation', () => {
        it('with constructor', () => {
            expect(() => {
                new Domain(new Observable())
            }).not.toThrow()
        })

        it('with actions', () => {
            expect(() => {
                Domain.create(
                    new Observable<{}>(),
                    {
                        test(v: number) {
                            // noop, just for types check
                        }
                    }
                )
            }).not.toThrow()
        })

        it('with null source Observable for small Domains', () => {
            expect(() => {
                new Domain(null).next(null)
                Domain.create(null, { test() {} }).test()
            }).not.toThrow()
        })

        it('with no source Observable for small Domains', () => {
            expect(() => {
                new Domain().next(null)
                Domain.create({ test() {} }).test()
            }).not.toThrow()
        })
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
