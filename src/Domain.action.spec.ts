import { dispatch } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
const { ALL } = DispatcherPriorities
import { Observable } from './Observable'
import { Domain } from './Domain'
import { action } from './Domain.action'

describe('Domain', () => {
    it('extending class method can be decorated to become an action', done => {
        class DerivativeOfDomain extends Domain<{}> {
            tested = false

            constructor() {
                super(new Observable())
            }

            @action
            test(v: boolean) {
                this.tested = v
            }
        }

        const subject = new DerivativeOfDomain()
        subject.test(true)
        expect(subject.tested).toBe(false)
        dispatch(() => {
            expect(subject.tested).toBe(true)
            setTimeout(done)
        }, ALL)
    })

    it('decorated class method returns promise of execution', done => {
        class DerivativeOfDomain extends Domain<{}> {
            tested = false

            constructor() {
                super(new Observable())
            }

            @action
            test(v: boolean) {
                this.tested = v
                return Promise.resolve()
            }
        }

        const subject = new DerivativeOfDomain()
        subject.test(true).then(() => {
            expect(subject.tested).toBe(true)
            setTimeout(done)
        })
        expect(subject.tested).toBe(false)
    })
})
