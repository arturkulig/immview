import { dispatch } from './DispatcherInstance'
import { BaseObservable } from './BaseObservable'

const fail = function (done, msg): () => void {
    return (): void => {
        expect(`${msg} WILL NOT HAPPEN`).toBe('')
        setTimeout(done)
    }
}

describe('BaseObservable', () => {
    describe('can be created', () => {
        it('with nothing', () => {
            expect(() => {
                new BaseObservable()
            }).not.toThrow()
        })

        it('with subscriber function', () => {
            expect(() => {
                new BaseObservable(() => { })
            }).not.toThrow()
        })

        it('w/o subscriber function', () => {
            expect(() => {
                new BaseObservable(null)
                new BaseObservable()
            }).not.toThrow()
        })
    })

    it('subscription destroyer will be destroyed', () => {
        let spyCalled = false
        const spy = () => { spyCalled = true }
        const $ = new BaseObservable(() => spy)
        $.complete()
        expect({ spyCalled }).toEqual({ spyCalled: true })
    })

    it('has deref() equal to last pushed value', done => {
        const subject = new BaseObservable(observer => { observer.next(6) })
        expect(subject.hasRef()).toBe(false)
        subject.subscribe(value => {
            expect(value).toEqual(subject.deref())
            done()
        })
    })

    it('is promise-like', async () => {
        const value = { details: 666 }
        const subject = new BaseObservable()
        setTimeout(() => {
            subject.next(value)
        }, 10)
        const derefed = await subject
        expect(derefed).toBe(value)
    })
})
