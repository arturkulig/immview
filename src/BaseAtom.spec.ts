import { dispatch } from './DispatcherInstance'
import { DispatcherPriorities } from './DispatcherPriorities'
const { ALL } = DispatcherPriorities
import { BaseAtom } from './BaseAtom'

const fail = function (done, msg): () => void {
    return (): void => {
        expect(`${msg} WILL NOT HAPPEN`).toBe('')
        setTimeout(done)
    }
}

const then =
    (action: () => any) =>
        dispatch(action, ALL)

describe('BaseAtom', () => {
    describe('can be created', () => {
        it('with initial state', () => {
            expect(() => {
                new BaseAtom(null)
            }).not.toThrow()
        })
    })

    it('is promise-like', async () => {
        const value = { details: 666 }
        const subject = new BaseAtom(value)
        const derefed = await subject
        expect(derefed).toBe(value)
    })
})
