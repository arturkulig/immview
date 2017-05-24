import { dispatch, flush } from './DispatcherInstance'

import { Observable } from './Observable'
import { Atom } from './Atom'
import { Domain } from './Domain'

describe('Domain', () => {
    describe('allows creation', () => {
        describe('with constructor', () => {
            it('with Observable', () => {
                expect(() => {
                    new Domain(new Observable())
                }).not.toThrow()
            })
            it('with Observable', () => {
                expect(() => {
                    new Domain(new Atom(null))
                }).not.toThrow()
            })
        })

        it('with actions', () => {
            expect(() => {
                Domain.create(
                    new Observable(),
                    {
                        test(v: number) {
                            // noop, just for types check
                        }
                    }
                )
            }).not.toThrow()
        })

        it('cannot create a Domain without a provided source', () => {
            expect(() => {
                new Domain(null).next(null)
                Domain.create(null, { test() { } }).test()
            }).toThrow()
        })
    })

    it('allows calling actions', async () => {
        let tested = false
        const TheDomain = Domain.create(
            new Observable(),
            { test() { tested = true } }
        )
        await TheDomain.test()
        await flush()
        expect({ tested }).toEqual({ tested: true })
    })

    it('action calls return Promises of execution', async () => {
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
        const result = await TheDomain.test()
        expect(result).toBe(undefined)
        expect({ tested }).toEqual({ tested: true })
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

    it('is promise-like', async () => {
        const value = { details: 666 }
        const subject = new Domain(new Atom(value))
        const derefed = await subject
        expect(derefed).toBe(value)
    })
})
