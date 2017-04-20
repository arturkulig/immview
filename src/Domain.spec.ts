import { dispatch, flush } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'

import { Observable } from './Observable'
import { Atom } from './Atom'
import { NO_VALUE } from './Types'
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

    it('allows creation of tagged Domains', async () => {
        let tested = false
        const subject = Domain.tagged`Root${'0'}fAllDevil`(new Observable(), { test() { tested = true } })
        expect(subject.name).toBe('Root0fAllDevil')
        await subject.test()
        expect(tested).toBe(true)
    })

    it('allows creation of tagged Domains', async () => {
        let tested = false
        const subject = Domain.create('Root0fAllDevil', new Observable(), { test() { tested = true } })
        expect(subject.name).toBe('Root0fAllDevil')
        await subject.test()
        expect(tested).toBe(true)
    })

    it('allows creation of tagged Domains with a stream', async () => {
        let tested = false
        const subjectStream = new Observable<any>()
        const subject = Domain.create('Root0fAllDevil', subjectStream, { test() { tested = true } })
        expect(subject.name).toBe('Root0fAllDevil')
        await subject.test()
        expect(tested).toBe(true)

        expect(subject.hasRef()).toBe(false)
        subject.subscribe(() => { })
        subjectStream.next(1)
        await flush()
        expect(subject.deref()).toBe(1)
    })
})
