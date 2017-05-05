import { dispatch } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
const { ALL } = DispatcherPriorities
import { BaseObservable } from './BaseObservable'

const fail = function (done, msg): () => void {
    return (): void => {
        expect(`${msg} WILL NOT HAPPEN`).toBe('')
        setTimeout(done)
    }
}

const then =
    (action: () => any) =>
        dispatch(action, ALL)

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

    it('has deref() equal to last pushed value', done => {
        const subject = new BaseObservable(observer => { observer.next(6) })
        expect(subject.hasRef()).toBe(false)
        subject.subscribe(value => {
            expect(value).toEqual(subject.deref())
            done()
        })
    })
})
