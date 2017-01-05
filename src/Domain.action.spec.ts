import { Observable } from './Observable'
import { Domain } from './Domain'
import { dispatch } from './DispatcherInstance'
import { action } from './Domain.action'

describe('Domain', () => {
    it('extending class method can be decorated to become an action', () => {
        class DerivativeOfDomain extends Domain<{}>{
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
        dispatch(() => {
            subject.test(true)
            expect(subject.tested).toBe(false)
        })
        expect(subject.tested).toBe(true)
    })
})
