import { dispatch } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
const { ALL } = DispatcherPriorities
import { BaseObservable } from './BaseObservable'
import {
    NO_VALUE
} from './Types'

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

    it('allowing multiple subscriptions before pushing values', done => {
        const subject = new BaseObservable(observer => {
            observer.next(5)
        })
        let o1SubHit = null
        subject.subscribe(v => { o1SubHit = v })
        let o2SubHit = null
        subject.subscribe(v => { o2SubHit = v })
        then(() => {
            expect({ o1SubHit }).toEqual({ o1SubHit: 5 })
            expect({ o2SubHit }).toEqual({ o2SubHit: 5 })
            setTimeout(done)
        })
    })

    it('has previous() equal to last pushed value', done => {
        const subject = new BaseObservable(observer => { observer.next(6) })
        expect(subject.previous()).toBe(NO_VALUE)
        subject.subscribe(value => {
            expect(value).toEqual(subject.previous())
            done()
        })
    })
})
