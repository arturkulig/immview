import { Observable } from './Observable'

describe('Observable', () => {
    it('can be create with static from', done => {
        let result = []
        Observable.from([1, 2, 3]).subscribe(
            value => {
                result.push(value)
                if (result.length === 3) {
                    setTimeout(done)
                }
            }
        )
    })

    it('can be create with static of', done => {
        let result = []
        Observable.of(1, 2, 3).subscribe(
            value => {
                result.push(value)
                if (result.length === 3) {
                    setTimeout(done)
                }
            }
        )
    })
})
